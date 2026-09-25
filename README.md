# Izzat Imran — cinematic portfolio

Next.js App Router, React and TypeScript. The homepage is a single scroll-driven story: a fixed canvas plays a rendered 3D character animation while six chapters (Introduction, About, Experience, Projects, Skills, Contact) fade in and out over it. The visitor's scroll position scrubs the animation in either direction; no WebGL or animation library is used.

Detailed case studies live at `/projects/padu`, `/projects/jejak` and `/projects/fyp-project`.

## Development

```sh
npm install
npm run dev
```

```sh
npm run lint
npx tsc --noEmit
npm run build
```

The `next/font` setup downloads Geist during a cold production build, so the build needs access to Google Fonts. Older case studies retain some existing `<img>` and unused-variable lint warnings.

## Structure

- `lib/portfolio-timeline.ts`: animation sources, 700svh scroll track, six chapter cues in video seconds, smoothing constants and experience/project subdivisions.
- `lib/portfolio-data.ts`: experience, projects (Selected work), skill groups and contact details.
- `lib/frame-rendering.ts`: canvas DPR caps and decode-size budget for the fallback frames.
- `components/portfolio/use-frame-sequence.ts`: loading, source selection, video scrubbing / frame drawing, scroll tracking, the smoothed master clock and item transitions.
- `components/portfolio/cinematic-portfolio.tsx`: semantic HTML, navigation, item selectors, loader/retry UI and contact actions.
- `components/portfolio/cinematic.css`: layout, responsive safe zones, item animations and reduced-motion rules.
- `app/projects/*`: case-study pages, linked in a loop (PADU → JEJAK → FYP → PADU) by side arrows on desktop and a bottom bar on mobile.

`public/cast-and-render.html` is the technical reference: fixed stage, normalized page progress, separate target/current positions, smoothstep enter/exit cues, deliberate empty zones and an all-intra video scrub. Its visual design is not used.

## Animation sources

The source render is a 10 s, 24 fps, 1280 × 720 clip (240 frames).

| Source | Path | Size | When it is used |
| --- | --- | ---: | --- |
| All-intra video | `public/video/avatar-intra.mp4` | 9.6 MiB | Primary, on every device |
| 120-frame WebP set | `public/frames-120/frame-001.webp`… | 3.5 MiB | Fallback |

**Video scrub (primary).** The clip is re-encoded so every frame is a keyframe (8 Mbps H.264, no B-frames, no audio; 49.5 dB mean PSNR against the source, visually lossless). It is downloaded fully into a blob before the page is revealed, then each timeline tick seeks to the middle of the wanted frame and draws it onto the canvas. Only one seek is in flight; fast scrolling jumps straight to the newest frame. Only one decoded frame is held in memory. On touch devices the video is played and paused once on the first interaction, because iOS will not paint frames from a video that has never played.

**Fallback frames.** Every 2nd source frame (12 fps), decoded once into `ImageBitmap`s at the display size (never above 1280 px) and drawn nearest-frame. The page switches to them automatically when the video fails to download (25 s limit), fails to decode, or seeks too slowly (median of five probe seeks over 50 ms), and when Data Saver or a 2G/3G connection is reported. The frames are captured from Chromium's own video decode, so both sources have identical colours.

Measured in headless Chromium (1440 × 900 at DPR 2), both sources hold 60 FPS. The video shows about twice the motion detail (1/24 s steps against 1/12 s) and adds about 330 MiB of browser memory, against about 700 MiB for the preloaded frames.

### Rebuilding the assets

```sh
# All-intra video from the original render (macOS, AVFoundation)
swift scripts/encode-all-intra.swift /path/to/original.mp4 public/video/avatar-intra.mp4 8000000

# Fallback frames, decoded by Chromium (dev server must be running)
node scripts/extract-fallback-frames.cjs /absolute/path/to/playwright
```

If the video is replaced, keep its duration and frame rate or update `frameConfig.video` and the chapter times.

## Master timeline

One continuous 0–1 `currentProgress` drives everything: the video time, chapter opacity/translation, the selected role or project, navigation state and the progress meter. Only `targetProgress` reads physical scrolling. Navigation clicks change the target through the same controller, without a second browser smooth-scroll. Resizing remaps the unchanged normalized target to the new scroll distance.

Chapters are timed in **video seconds**, not frame numbers, so any frame density maps to the same moment: `framePosition = videoTime × fps` (24 for the video, 12 for the fallback). Pacing is piecewise linear with shared endpoints, so section boundaries never jump.

| Chapter | Master range | Video time | Visual action |
| --- | --- | --- | --- |
| Introduction | 0–16% | 0–1.17 s | Opening stance |
| About | 16–31% | 1.17–2.75 s | First steps |
| Experience | 31–48% | 2.75–4.54 s | Walking forward |
| Projects | 48–75% | 4.54–6.75 s | Approach and turn |
| Skills | 75–88% | 6.75–8.17 s | Taking a seat |
| Contact | 88–100% | 8.17–9.92 s | Phone and final seated pose |

The source contains one hard cut (facing away → facing the camera) between frames 156 and 157 (6.52 s). It plays at 72.2% progress, inside the empty Projects → Skills gap, where no text or navigation item is visible. Contact stays fully visible at 100%. The sequence ends on source frame 238, which both sources contain.

Smoothing is refresh-rate independent: 0.16 at 60 Hz for small movements, a faster catch-up for large gaps, and a bounded finish of about 300 ms. The animation loop sleeps when idle, and React state is never updated per scroll frame.

## Interaction details

- **Item transitions.** In Experience and Selected work, the outgoing entry drifts out and blurs while the incoming one staggers in from the scroll direction (date, title, company, bullets, tags). The selector underline slides between tabs. Only one entry leaves at a time, and it is taken out of layout so the panel resizes once.
- **Accessibility.** Hidden panels and leaving items are inert. Navigation supports keyboard input and chapter hashes (`/#contact`). Reduced motion removes smoothing, panel translation and item animations while keeping the animation scroll-controlled. A no-JavaScript fallback links to the case studies and email.
- **Loading.** The loader shows download progress for the video, or decoded-frame progress for the fallback. If fallback frames fail, visitors can retry or continue with the frames that loaded; missing frames hold the last valid image.

## Development inspector

Open `/?timelineDebug=1` under `npm run dev` to see target/current progress, video time, fractional frame position, the frame actually drawn, the section, the source (`video` or `frames`), FPS and the draw count. Overrides for comparison:

- `/?timelineDebug=1&source=frames` forces the fallback frames (`source=video` forces the video).
- `/?timelineDebug=1&scrollVh=600` tries another track height (550–800svh).
- `/?timelineDebug=1&source=frames&frameMode=blend` crossfades adjacent fallback frames (not recommended: faces and limbs double).

The overlay and query overrides are compiled out of production.

## Verification

```sh
node scripts/test-timeline.cjs
```

Checks 20,001 progress samples: monotone and continuous video time, identical moments for the video and fallback, the source cut falling in an empty gap, non-overlapping cues, navigation destinations, endpoints, reversal, reduced motion and settling at 30–144 Hz.

Browser checks need Playwright with Chromium and the **development** server running:

```sh
node scripts/check-portfolio.cjs /absolute/path/to/playwright
node scripts/check-mobile-timeline.cjs /absolute/path/to/playwright
```

The desktop suite compares the drawn frame, cue opacity, navigation and progress meter against the master clock during slow, fast and reverse movement; clicks every chapter and project; runs five viewport changes; confirms the video and fallback show the same moments; forces the video to fail and checks the automatic fallback; and checks the partial-failure percentage and last-valid-frame hold. The mobile suite uses native touch events and checks the video source, orientation changes, the DPR cap and the total-failure fallback. Set `PORTFOLIO_URL` to test another server; canvas captures are written to `/tmp/portfolio-{video,frames}-*.png`.

## Legacy tools

`scripts/upscale-frames.cjs` (`npm run frames:upscale` / `frames:verify`), `scripts/benchmark-frame-sources.cjs` and `scripts/profile-scroll.cjs` were written for the earlier 50-frame PNG sequence (`public/frame-png`, `public/frame-png-upscaled`). Those assets are no longer used or committed, so the scripts only run if they are restored. Their findings are kept in `reports/`: `scroll-smoothness-review.md` explains the earlier canvas-stall fix (bilinear drawing, one-time high-quality decode), and `frame-upscale-review.md` covers the upscale trial.

## Content notes

The source supplied `github.com/izzatimran`, but only a generic `https://linkedin.com` link. That destination remains in `socialLinks`; replace it with the verified profile when available. No résumé asset or URL was present, so no résumé link has been added.
