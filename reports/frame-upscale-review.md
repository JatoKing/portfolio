# Frame upscale review

## Assets and processing

- 50 originals: `public/frame-png/ezgif-frame-001.png` through `ezgif-frame-050.png`.
- All originals are 1280 × 720, 16:9, sRGB PNGs without alpha. Despite the request's JPG description, there are no JPG source frames.
- All outputs preserve exact filenames and PNG format in `public/frame-png-upscaled`, at 2560 × 1440. Keeping PNG avoids unnecessary lossy re-encoding and preserves the animation's filenames.
- Original sizes: 211,954–386,980 bytes; total 16,769,640 bytes.
- Upscaled sizes: 551,725–923,107 bytes; total 40,073,827 bytes.
- No local super-resolution model was available. Sharp 0.34.5 / libvips 8.17.3 applies deterministic 2× cubic resampling with identical mild luminance sharpening to every frame. No invented details, denoising, exposure, white balance, saturation, or contrast adjustments.
- This is conservative interpolation and edge enhancement, not recovery of missing high-resolution detail.

Exact settings, versions, checksums, dimensions, and all 49 adjacent-frame comparisons are recorded in `frame-upscale.json`.

## Verification and visual inspection

Every original checksum matches the inventory taken before processing. All 50 outputs fully decode and preserve names, numeric order, dimensions, and aspect ratio. The timeline file's checksum is unchanged.

Original/upscaled contact sheets were inspected for frames 1–3, 10–12, 20–22, 30–32, 40–42, and 48–50. High-DPR canvas crops were also compared. Edges are modestly crisper; appearance, poses, composition, and colours remain consistent. No new obvious halos or inconsistent details appeared in the inspected samples. The source's existing 34→35 pose cut remains.

At a common 320 × 180 comparison size, mean absolute error is 0.306 on a 0–255 scale, worst per-frame channel-average shift is 0.073, and worst adjacent-frame processing-residual difference is 0.485. These checks help detect introduced changes; they do not prove absence of flicker under every viewing condition.

## Production-browser comparison

Eight fresh-browser trials compared the unmodified production animation: two per source and viewport. The benchmark routed image requests within its isolated browser, decoded all 50 images, scrolled forward and backward through the real timeline, and checked matching frame indices at identical progress values. No page errors occurred.

| Measurement (median of two trials) | Desktop original | Desktop upscale | Mobile emulation original | Mobile emulation upscale |
| --- | ---: | ---: | ---: | ---: |
| Local frame loading + decoding | 237 ms | 412 ms | 129 ms | 322 ms |
| Scroll RAF rate | 26.33 fps | 26.11 fps | 60.00 fps | 59.75 fps |
| p95 RAF interval | 83.3 ms | 75.1 ms | 16.8 ms | 16.8 ms |
| p95 canvas draw submission | 0.10 ms | 0.10 ms | 0.10 ms | 0.10 ms |
| Browser resident-memory increase after loading | 426 MiB | 1,009 MiB | 320 MiB | 895 MiB |
| Estimated decoded RGBA image pixels | 176 MiB | 703 MiB | 176 MiB | 703 MiB |

Desktop viewport: 1440 × 900 at DPR 2. Mobile emulation: 390 × 844 at DPR 3, with the existing canvas DPR cap. Desktop headless rendering was slow for both sources, so these results do not establish smooth performance on physical high-resolution displays. Mobile emulation runs on the desktop host and does not establish real-phone performance. Draw timings measure CPU submission, not full GPU completion. Resident memory includes other browser allocations and does not capture all GPU memory.

Loading was measured over localhost. At 20 Mbps, transfer alone is approximately 6.71 seconds for originals versus 16.03 seconds for the upscale, before latency and decoding. Full trial data and limitations are in `frame-source-performance.json`.

## Initial source decision

Keep `/frame-png` active in production on all devices. The upscale is complete and available, but its modest clarity improvement does not justify 2.39× transfer size and 4× decoded pixel memory for the current preload-all architecture. Do not enable it automatically based only on viewport width or DPR. A future opt-in or desktop rollout should first pass physical-device/network tests and address the decoded-memory budget.

Frame count, filenames, frame order, master progress, section cues, and navigation timing remain unchanged.

## Subsequent owner-requested activation

The owner subsequently requested using the sharper assets. The loader now selects the upscaled set on initial load for viewports at least 1024px wide without a coarse primary pointer, unless Data Saver is enabled or reported device memory is 4 GB or less. Other devices retain the originals. The selection stays fixed through viewport changes, and only one set is decoded. This changes the source policy, not the measured costs above or the master timeline. The canvas exposes its selected directory through `data-frame-source`.
