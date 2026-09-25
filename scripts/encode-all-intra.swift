// Re-encode a video as all-intra H.264 (every frame a keyframe, no B-frames, no audio,
// moov atom first) so a scroll scrub can seek to any frame without decoding neighbours.
// Usage: swift scripts/encode-all-intra.swift <input.mp4> <output.mp4> <bitrate-bps>
// Re-encode as all-intra H.264 (every frame a keyframe, no B-frames), no audio, moov first.
let src = URL(fileURLWithPath: CommandLine.arguments[1]), dst = URL(fileURLWithPath: CommandLine.arguments[2])
let bitrate = Int(CommandLine.arguments[3])!
try? FileManager.default.removeItem(at: dst)
let asset = AVURLAsset(url: src); let track = asset.tracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
let out = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
reader.add(out)
let writer = try! AVAssetWriter(outputURL: dst, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: 1280, AVVideoHeightKey: 720,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: bitrate, AVVideoMaxKeyFrameIntervalKey: 1, AVVideoMaxKeyFrameIntervalDurationKey: 0,
    AVVideoAllowFrameReorderingKey: false, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoExpectedSourceFrameRateKey: 24,
  ] as [String: Any],
  AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2, AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2, AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2],
])
input.expectsMediaDataInRealTime = false
writer.add(input); reader.startReading(); writer.startWriting(); writer.startSession(atSourceTime: .zero)
var n = 0
while let s = out.copyNextSampleBuffer() { while !input.isReadyForMoreMediaData { usleep(1000) }; input.append(s); n += 1 }
input.markAsFinished()
let sem = DispatchSemaphore(value: 0); writer.finishWriting { sem.signal() }; sem.wait()
let size = (try! FileManager.default.attributesOfItem(atPath: dst.path)[.size] as! NSNumber).intValue
// verify: count sync samples
let check = AVURLAsset(url: dst); let ct = check.tracks(withMediaType: .video)[0]
let r2 = try! AVAssetReader(asset: check); let o2 = AVAssetReaderTrackOutput(track: ct, outputSettings: nil); r2.add(o2); r2.startReading()
var total = 0, sync = 0
while let s = o2.copyNextSampleBuffer() { if CMSampleBufferGetNumSamples(s) == 0 { continue }; total += 1
  let att = CMSampleBufferGetSampleAttachmentsArray(s, createIfNecessary: false) as? [[CFString: Any]]
  if !(att?.first?[kCMSampleAttachmentKey_NotSync] as? Bool ?? false) { sync += 1 } }
print("status", writer.status.rawValue, "frames in", n, "frames out", total, "keyframes", sync, "bytes", size, String(format: "%.2f MiB", Double(size)/1048576), "fps", ct.nominalFrameRate, "dur", CMTimeGetSeconds(check.duration))
