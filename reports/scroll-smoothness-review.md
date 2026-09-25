# Scroll smoothness diagnosis and changes

## Diagnosis: both rendering cost and source-frame limits

The existing system already had one normalized, delta-time-aware master clock, fractional frame positions, passive native scroll input, predecoded ImageBitmaps, a sleeping RAF loop, and synchronized chapter cues/navigation/progress. No competing scroll library or per-scroll React state updates were found. Increasing easing would have concealed the problem with more input lag.

The actual assets are 50 PNGs, `ezgif-frame-001.png` through `050.png`, numerically ordered. Originals are uniformly 1280 × 720, total 16,769,640 bytes. Upscales are uniformly 2560 × 1440, total 40,073,827 bytes. The source has large differences between some consecutive poses, including a pronounced cut between frames 34 and 35. Upscaling adds no intermediate motion.

No original video, GIF, 3D model, or animation project was found in the repository. The external video referenced by `public/cast-and-render.html` belongs to the technical reference; it is not assumed to be the source of this character animation. The LinkedIn post could not be fetched, so its actual motion and technology were not verified. The supplied local HTML's fixed stage, normalized progress, interpolation, and cue/dead-zone design were reviewed.

## Browser isolation tests before changing the engine

Headless Chromium against the production build, 1440 × 900 viewport at DPR 2, 180 measured RAF intervals, native page-position changes forward and backward. Profiling included a Long Tasks observer, MutationObserver, CDP performance counters, and timeline/V8 tracing.

| Variant | RAF FPS | p95 interval | Long tasks ≥50 ms | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Existing renderer, upscaled sources | 29.03 | 50.1 ms | 94 | Repeated ~55 ms stalls coincide with image changes |
| Canvas drawing disabled | 60.00 | 16.8 ms | 0 | Isolates drawing as the main runtime cost |
| Text/navigation hidden | 29.11 | 50.1 ms | 94 | Content layout is not the primary bottleneck |
| DPR 1 | 60.00 | 16.8 ms | 0 | Cost grows with rendered pixel area |
| Original source images, same DPR 2 canvas | 28.57 | 50.1 ms | 94 | Merely switching source folders does not fix the draw cost |
| Canvas medium resampling | 56.84 | 33.3 ms | 0 | Better, but still misses refresh intervals |
| Canvas bilinear resampling | 60.00 | 16.8 ms | 0 | Removes stalls while preserving the Retina buffer |
| 1920px predecoded frames + bilinear draws | 60.00 | 16.8 ms | 0 | Also reduces decoded memory |

No image decoding occurred during any measured scroll run. Baseline JavaScript occupied about 24 ms total; layout about 16 ms total, compared with 5.45 seconds of main-thread task time. GC observed in comparison trials was brief, not the repeated 55 ms stalls. This evidence points to repeated high-quality canvas resampling as the dominant measured implementation issue, with source sparsity as a separate visible limitation. Exact raw results are in `scroll-profile-before.json`.

## Changes

- High-quality resizing happens once during `createImageBitmap`, uniformly for the entire sequence. Decode dimensions match the initial display needs, preserve exact 16:9 aspect ratio, and are capped at 1920 × 1080. No duplicate full-resolution cache is retained.
- Canvas draws use bilinear image smoothing instead of repeating expensive high-quality resampling for every changed frame. Retina DPR remains capped at 2 desktop / 1.5 narrow mobile.
- Only changed chapter labels, navigation state, accessibility attributes, and selected project/experience items are written to the DOM. Section opacity/position still derives directly from the same master clock.
- Development diagnostics now include active RAF FPS, loaded frame count, source folder, and decoded width. Text refresh is throttled; diagnostic snapshots still reflect every timeline tick. Production contains no inspector.
- No changes to easing coefficients, timeline mapping, chapter cues, source files, navigation destinations, or visual design. Desktop still selects the upscaled folder under the existing device policy; mobile retains originals. Source choice and decode dimensions remain fixed for the visit, including resize/orientation changes.

At the maximum decode size, image pixels require about **395.5 MiB instead of 703.1 MiB**, a 43.75% reduction. Download size remains 40.07 MB for desktop upscaled sources. Smaller initial displays decode smaller frames. Comparisons of the rendered face/clothing showed only a small sharpness difference at 1920px; no changed design or invented features. Canvas captures are `/tmp/scroll-quality-{normal,low,sized}.png` from the isolation trials (later profiles may overwrite the normal capture).

## Final measurements and verification

Two final production runs at the same 2880 × 1800 canvas resolution both measured **60.00 RAF FPS**, p95 16.7–16.8 ms, **zero long tasks** and **zero intervals over 25 ms**. Main-thread task time fell to approximately 1.29 seconds over the three-second scroll workload. Chapter/item/accessibility mutation counts fell substantially; for example, `aria-hidden` writes fell from 1,068 to 20 and item `hidden` writes from 1,440 to 96. See `scroll-profile-after.json`.

The browser suite verified slow/fast/reverse scrolling, synchronized transient frame/text/nav/progress values, all requested boundaries, chapter navigation, seven project selectors, five viewport changes, reduced motion, stable endpoints, deep links, idle drawing, and last-valid-frame fallback. Native Chromium touch input, orientation preservation, mobile DPR, and complete-load-failure fallback also passed. The math suite covers 20,001 progress samples and settling at 30/60/90/120/144 Hz. Production build and TypeScript pass.

Trackpad-style 12 × 20px wheel input at 1440 × 900 measured:

| Track height | Scrollable distance | Average px/source interval | Frames crossed by 240px in Projects |
| --- | ---: | ---: | ---: |
| 600svh | 4500px | 91.8 | 2.17 |
| 700svh | 5400px | 110.2 | 1.81 |
| 750svh | 5850px | 119.4 | 1.67 |
| 800svh | 6300px | 128.6 | 1.55 |

Retain 700svh: it provides precise control without extending the hold on each sparse source pose further. Optional adjacent-frame blending was exercised and inspected again; doubled faces/hands/chair edges make it unsuitable as the default. Nearest-frame rendering is retained.

## Remaining limitation and next source decision

The implementation stalls are fixed in the measured workload. **The 50-frame source is still insufficient for continuously changing poses during very slow scrolling.** A 60 FPS browser clock does not make a 50-pose sequence into a 180-pose sequence. The first few nearly static frames and the existing 34→35 pose cut remain. No fake duplicates, blur, or additional easing were added to conceal them.

A genuine increase to 100, 120, 150, or 180 frames requires the original video or animation render. Compare actual intermediate frames from that source when available; choose based on its true frame rate/duration, then tune memory/loading and remap the existing master timeline to the same visual moments. Increasing to 180 frames at the present preload-all 1920px decode size would require roughly 1.39 GiB of raw image pixels, so a larger source should be paired with a tested bounded decode cache or lower decoded dimensions.

These are local headless Chromium measurements, not a guarantee for every GPU or a physical MacBook/phone. Wheel/touch input is browser-emulated. No claim is made that the inaccessible LinkedIn motion has been matched, or that the missing intermediate poses have been fixed.
