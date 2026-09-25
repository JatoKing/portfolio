"use client";

import { useEffect, useRef, useState } from "react";
import {
  advanceMaster, chapters, chapterStyle, clamp, frameConfig, getActiveChapter,
  getChapterDestination, getFramePath, getFrameSample, getSubjectX, getVideoTime, itemIndex,
  sourceCount, sourceFps, type ChapterId, type MasterClock, type RenderMode, type SourceKind,
} from "@/lib/portfolio-timeline";
import { experience, projects } from "@/lib/portfolio-data";
import { frameRendering, getDecodeDimensions } from "@/lib/frame-rendering";

type FrameSample = ReturnType<typeof getFrameSample>;
type Engine = MasterClock & {
  framePosition: number;
  context: CanvasRenderingContext2D | null;
  animationFrameId: number;
  lastTime: number;
  lastRenderedKey: string;
  lastValidSample: FrameSample | null;
  lastPaintedProgress: number;
  maxScroll: number;
  drawCount: number;
};
const freshEngine = (): Engine => ({
  targetProgress: 0, currentProgress: 0, lastInputTime: 0, framePosition: 0,
  context: null, animationFrameId: 0, lastTime: 0, lastRenderedKey: "",
  lastValidSample: null, lastPaintedProgress: NaN, maxScroll: 0, drawCount: 0,
});

export function useFrameSequence() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const chapterCounter = useRef<HTMLSpanElement>(null);
  const debug = useRef<HTMLOutputElement>(null);
  const engine = useRef<Engine>(freshEngine());
  const seek = useRef<(progress: number) => void>(() => {});
  const release = useRef<() => void>(() => {});
  // `loaded / total` drives the loader: download percent for video, frames for the fallback.
  const [loading, setLoading] = useState({ loaded: 0, total: 100, failed: 0, settled: false });
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const stage = canvas.current;
    const container = root.current;
    if (!stage || !container) return;
    const state = engine.current = freshEngine();
    state.context = stage.getContext("2d", { alpha: false });
    const context = state.context;
    if (!context) {
      release.current = () => setReady(true);
      setLoading({ loaded: 0, total: frameConfig.count, failed: frameConfig.count, settled: true });
      return;
    }
    const controller = new AbortController();
    const device = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    // The all-intra video is the primary source on every device: full 24 fps, native
    // 1280x720, and only one decoded frame in memory. The 120-frame set is used when
    // the video cannot be downloaded, decoded, or seeked quickly enough.
    let source: SourceKind = device.connection?.saveData || /(^|-)2g$|^3g$/.test(device.connection?.effectiveType ?? "")
      || !document.createElement("video").canPlayType('video/mp4; codecs="avc1.640028"') ? "frames" : "video";
    const images: (ImageBitmap | undefined)[] = new Array(frameConfig.count);
    const video = document.createElement("video");
    let videoUrl = "";
    // Latest requested frame, frame being decoded, and frame currently on the canvas.
    let wantedFrame = 0, seekingFrame: number | null = null, shownFrame = -1, videoReady = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const panels = chapters.map(cue => container.querySelector<HTMLElement>(`[data-chapter="${cue.id}"]`)!);
    const nav = [...container.querySelectorAll<HTMLElement>("[data-nav]")];
    const items = ["experience", "projects"].map(id => [...container.querySelectorAll<HTMLElement>(`[data-${id}-item]`)]);
    const itemButtons = ["experience", "projects"].map(id => [...container.querySelectorAll<HTMLElement>(`[data-${id}-button]`)]);
    const lastPanels: ({ opacity: number; y: number; interactive: boolean } | undefined)[] = [];
    const lastItems = [-1, -1];
    let lastActive: ChapterId | null | undefined;
    let fps = 0, fpsElapsed = 0, fpsSamples = 0, debugPaintTime = 0;
    let disposed = false, enabled = false;
    let width = 0, height = 0, dpr = 1, loaded = 0, failed = 0;
    // `pan`: portrait screens show a full-bleed stage that follows the character.
    let geometry = { x: 0, y: 0, width: 0, height: 0, scale: 1, pan: false };
    function placed(time: number) {
      if (!geometry.pan) return geometry;
      const x = clamp(width / 2 - getSubjectX(time) * geometry.scale, width - geometry.width, 0);
      return { ...geometry, x };
    }
    let restoredScrollY: number | null = null;
    let renderMode: RenderMode = frameConfig.renderMode;
    let debugEnabled = false;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Development-only experiments. Production never reads these query overrides.
    if (process.env.NODE_ENV === "development") {
      const params = new URLSearchParams(window.location.search);
      debugEnabled = params.get("timelineDebug") === "1";
      if (debugEnabled) {
        const mode = params.get("frameMode");
        if (mode === "blend" || mode === "nearest") renderMode = mode;
        const forced = params.get("source");
        if (forced === "video" || forced === "frames") source = forced;
        const track = container.querySelector<HTMLElement>(".scroll-track");
        const vh = Number(params.get("scrollVh"));
        if (track && [550, 600, 650, 700, 750, 800].includes(vh)) track.style.height = `${vh}svh`;
        if (debug.current) debug.current.hidden = false;
      }
    }

    function draw(request: FrameSample, force = false) {
      if (!context || !stage) return;
      let sample: FrameSample;
      if (renderMode === "blend" && images[request.lower] && images[request.upper]) {
        sample = { ...request, mix: Math.round(request.mix * frameConfig.blendSteps) / frameConfig.blendSteps };
      } else if (renderMode === "nearest" && images[request.nearest]) {
        sample = { lower: request.nearest, upper: request.nearest, nearest: request.nearest, mix: 0 };
      } else if (state.lastValidSample) {
        // Missing source: retain the actual last valid render, including on resize.
        sample = state.lastValidSample;
      } else {
        const first = images.findIndex(Boolean);
        if (first < 0) return; // Never clear the canvas while waiting for a source.
        sample = { lower: first, upper: first, nearest: first, mix: 0 };
      }
      const key = `${sample.lower}:${sample.upper}:${sample.mix}`;
      if (!force && state.lastRenderedKey === key) return;
      const lower = images[sample.lower], upper = images[sample.upper];
      if (!lower || !upper) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.globalAlpha = 1;
      context.fillStyle = frameConfig.background;
      context.fillRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = frameRendering.canvasSmoothing;
      const { x, y, width: w, height: h } = placed((sample.lower + sample.mix) / frameConfig.fps);
      // Draw an opaque base, then the adjacent image on top. Two translucent
      // source-over draws would incorrectly leak the background and darken edges.
      context.drawImage(lower, x, y, w, h);
      if (sample.upper !== sample.lower && sample.mix > 0) {
        context.globalAlpha = sample.mix;
        context.drawImage(upper, x, y, w, h);
      }
      context.globalAlpha = 1;
      state.lastValidSample = sample;
      state.lastRenderedKey = key;
      state.drawCount++;
      stage.dataset.frame = String(sample.nearest + 1);
    }

    // Video source: paint whatever frame the decoder presents, then chase the latest
    // request. Only one seek is in flight, so fast scrolling skips straight to the newest
    // frame instead of queueing stale ones.
    function paintVideo() {
      if (!context || !stage || shownFrame < 0) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.globalAlpha = 1;
      context.fillStyle = frameConfig.background;
      context.fillRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = frameRendering.canvasSmoothing;
      const { x, y, width: w, height: h } = placed(shownFrame / frameConfig.video.fps);
      context.drawImage(video, x, y, w, h);
      state.drawCount++;
      stage.dataset.frame = String(shownFrame + 1);
    }
    function seekVideo(frame: number) {
      wantedFrame = frame;
      if (!videoReady || seekingFrame !== null || wantedFrame === shownFrame) return;
      seekingFrame = wantedFrame;
      // Aim at the middle of the frame so timestamp rounding can never land on its neighbour.
      video.currentTime = (seekingFrame + .5) / frameConfig.video.fps;
    }
    function onSeeked() {
      if (seekingFrame === null) return;
      shownFrame = seekingFrame;
      seekingFrame = null;
      paintVideo();
      paintDebug();
      if (wantedFrame !== shownFrame) seekVideo(wantedFrame);
    }
    function render(framePosition: number, force = false) {
      if (source === "frames") return draw(getFrameSample(framePosition), force);
      const frame = Math.round(clamp(framePosition, 0, frameConfig.video.frames - 1));
      if (force) paintVideo();
      seekVideo(frame);
    }

    function paint() {
      const progress = state.currentProgress; // The ONLY visual clock.
      if (state.lastPaintedProgress === progress) return;
      state.lastPaintedProgress = progress;
      if (meter.current) meter.current.style.transform = `scaleX(${progress})`;
      const active = getActiveChapter(progress);
      const activeIndex = active ? chapters.indexOf(active) : -1;
      if (lastActive !== (active?.id ?? null)) {
        lastActive = active?.id ?? null;
        if (chapterCounter.current) chapterCounter.current.textContent = active
          ? `${String(activeIndex + 1).padStart(2, "0")} / 06 — ${active.label}`
          : "— / 06 — Interlude";
        nav.forEach(link => {
          if (link.dataset.nav === active?.id) link.setAttribute("aria-current", "step");
          else link.removeAttribute("aria-current");
        });
      }
      panels.forEach((panel, index) => {
        const { opacity, y } = chapterStyle(progress, chapters[index]);
        const interactive = opacity > .6;
        const previous = lastPanels[index];
        if (previous?.opacity !== opacity) {
          panel.style.opacity = String(opacity);
          panel.style.visibility = opacity > .001 ? "visible" : "hidden";
        }
        if (previous?.y !== y) panel.style.transform = motion.matches ? "none" : `translate3d(0, ${y}px, 0)`;
        if (previous?.interactive !== interactive) {
          panel.style.pointerEvents = interactive ? "auto" : "none";
          if (!interactive && panel.contains(document.activeElement)) container?.focus({ preventScroll: true });
          panel.inert = !interactive;
          panel.setAttribute("aria-hidden", String(!interactive));
        }
        lastPanels[index] = { opacity, y, interactive };
      });
      (["experience", "projects"] as const).forEach((id, group) => {
        const selected = itemIndex(progress, id, group === 0 ? experience.length : projects.length);
        if (lastItems[group] === selected) return;
        const previous = lastItems[group];
        lastItems[group] = selected;
        switchItem(group, previous, selected);
        itemButtons[group].forEach((button, index) => button.setAttribute("aria-pressed", String(index === selected)));
        moveIndicator(group);
      });
    }

    // Item transitions: the outgoing entry drifts away (out of layout, so the panel
    // resizes once) while the incoming one staggers in from the scroll direction.
    const itemTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    function settle(item: HTMLElement) {
      clearTimeout(itemTimers.get(item));
      itemTimers.delete(item);
      delete item.dataset.state;
    }
    function switchItem(group: number, previous: number, selected: number) {
      const animate = previous >= 0 && !motion.matches;
      const direction = selected > previous ? "1" : "-1";
      items[group].forEach((item, index) => {
        if (index !== selected && item.contains(document.activeElement)) container?.focus({ preventScroll: true });
        if (index === selected) {
          settle(item);
          item.hidden = false;
          item.inert = false;
          if (!animate) return;
          item.style.setProperty("--item-dir", direction);
          void item.offsetWidth; // restart the entrance if it was interrupted mid-way
          item.dataset.state = "entering";
          itemTimers.set(item, setTimeout(() => settle(item), 900));
        } else if (animate && index === previous && !item.hidden) {
          // Only one entry leaves at a time: skipping through items never stacks ghosts.
          settle(item);
          item.inert = true;
          item.style.setProperty("--item-dir", direction);
          item.dataset.state = "leaving";
          itemTimers.set(item, setTimeout(() => { item.hidden = true; item.inert = false; settle(item); }, 240));
        } else {
          settle(item);
          item.hidden = true;
          item.inert = false;
        }
      });
    }
    // The selector underline slides to the pressed tab instead of jumping.
    function moveIndicator(group: number) {
      const button = itemButtons[group].find(b => b.getAttribute("aria-pressed") === "true");
      const bar = button?.parentElement;
      if (!button || !bar) return;
      bar.style.setProperty("--indicator-x", `${button.offsetLeft}px`);
      bar.style.setProperty("--indicator-w", `${button.offsetWidth}px`);
    }

    function paintDebug() {
      if (process.env.NODE_ENV !== "development" || !debugEnabled || !debug.current) return;
      const active = getActiveChapter(state.currentProgress);
      const snapshot = {
        targetProgress: state.targetProgress, currentProgress: state.currentProgress,
        videoTime: getVideoTime(state.currentProgress), framePosition: state.framePosition,
        renderedFrame: source === "video" ? (shownFrame < 0 ? null : shownFrame) : state.lastValidSample?.nearest ?? null,
        seekPending: source === "video" && (seekingFrame !== null || wantedFrame !== shownFrame),
        lower: state.lastValidSample?.lower, upper: state.lastValidSample?.upper,
        mix: state.lastValidSample?.mix, section: active?.id ?? null,
        localProgress: active ? chapterStyle(state.currentProgress, active).local : 0,
        drawCount: state.drawCount, renderMode, maxScroll: state.maxScroll,
        fps, loadedFrames: loaded, source, frameCount: sourceCount(source),
        decodedWidth: source === "video" ? video.videoWidth : images.find(Boolean)?.width ?? 0,
      };
      debug.current.dataset.snapshot = JSON.stringify(snapshot);
      const now = performance.now();
      if (now - debugPaintTime < 100 && state.currentProgress !== state.targetProgress) return;
      debugPaintTime = now;
      debug.current.textContent = `Scroll: ${snapshot.targetProgress.toFixed(4)}\nSmoothed: ${snapshot.currentProgress.toFixed(4)}\nFrame position: ${snapshot.framePosition.toFixed(3)}\nRendered frame: ${snapshot.renderedFrame === null ? "—" : snapshot.renderedFrame + 1}\nSection: ${active?.label ?? "Frame-only interlude"}\nLocal progress: ${snapshot.localProgress.toFixed(3)}\nFPS (active): ${fps || "—"}\nSource: ${source} · ${sourceCount(source)} frames · ${snapshot.decodedWidth}px\nMode: ${source === "video" ? "video scrub" : renderMode} · Draws: ${state.drawCount}`;
    }

    function tick(time: number) {
      state.animationFrameId = 0;
      if (disposed || !enabled || document.hidden) return;
      const dt = Math.min(time - (state.lastTime || time - 1000 / 60), 64);
      if (process.env.NODE_ENV === "development" && debugEnabled && state.lastTime) {
        fpsElapsed += time - state.lastTime;
        fpsSamples++;
        if (fpsElapsed >= 250) { fps = Math.round(fpsSamples * 1000 / fpsElapsed); fpsSamples = fpsElapsed = 0; }
      }
      state.lastTime = time;
      state.currentProgress = advanceMaster(state, dt, time, motion.matches);
      state.framePosition = getVideoTime(state.currentProgress) * sourceFps(source);
      render(state.framePosition);
      paint();
      paintDebug();
      if (state.currentProgress !== state.targetProgress) state.animationFrameId = requestAnimationFrame(tick);
      else state.lastTime = 0;
    }
    function wake() {
      if (enabled && !state.animationFrameId && !disposed && !document.hidden) state.animationFrameId = requestAnimationFrame(tick);
    }
    function readScroll() {
      if (!enabled) return;
      // Resize can dispatch scroll before resize. Preserve both clocks first.
      if (window.innerWidth !== width || window.innerHeight !== height) { resize(); return; }
      if (restoredScrollY !== null) {
        const restored = Math.abs(window.scrollY - restoredScrollY) <= 1;
        restoredScrollY = null;
        if (restored) { wake(); return; }
      }
      const next = state.maxScroll > 0 ? clamp(window.scrollY / state.maxScroll) : 0;
      if (next !== state.targetProgress) {
        state.targetProgress = next;
        state.lastInputTime = performance.now();
        wake();
      }
    }
    function resize() {
      if (!stage || !context) return;
      width = window.innerWidth;
      height = window.innerHeight;
      state.maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
      dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? frameRendering.mobileDpr : frameRendering.desktopDpr);
      stage.width = Math.round(width * dpr);
      stage.height = Math.round(height * dpr);
      // Initial/all-failed state uses the existing neutral stage, never the
      // opaque canvas's default black buffer. Valid sources repaint synchronously.
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = frameConfig.background;
      context.fillRect(0, 0, width, height);
      // Portrait: the animation becomes a full-screen background (cover) that pans
      // with the character. Landscape: the whole frame stays visible (contain).
      const portrait = width / height <= 1.25;
      const scale = portrait
        ? Math.max(width / frameConfig.width, height / frameConfig.height)
        : Math.min(width / frameConfig.width, height / frameConfig.height);
      const w = frameConfig.width * scale, h = frameConfig.height * scale;
      geometry = { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h, scale, pan: portrait };
      if (enabled) {
        // Remap the same normalized target to the new physical track. Never
        // replace currentProgress with scrollY/newMax during a viewport change.
        restoredScrollY = Math.round(state.targetProgress * state.maxScroll);
        window.scrollTo({ top: restoredScrollY, behavior: "instant" });
      }
      [0, 1].forEach(moveIndicator);
      // Canvas resizing clears its buffer: repaint the saved valid source now.
      if (source === "video") render(state.framePosition, true);
      else draw(state.lastValidSample ?? getFrameSample(state.framePosition), true);
      paintDebug();
      wake();
    }
    function seekProgress(progress: number) {
      if (!enabled) return;
      restoredScrollY = null;
      // No browser smooth-scroll animation on top of master smoothing.
      window.scrollTo({ top: clamp(progress) * state.maxScroll, behavior: "instant" });
      readScroll();
    }
    seek.current = seekProgress;
    function onMotionChange() { lastPanels.length = 0; state.lastPaintedProgress = NaN; wake(); }
    function onHashChange() {
      const id = window.location.hash.slice(1) as ChapterId;
      if (chapters.some(c => c.id === id)) seekProgress(getChapterDestination(id));
    }
    function onVisibilityChange() {
      cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = 0;
      state.lastTime = 0;
      wake();
    }
    function start() {
      if (disposed || enabled) return;
      document.body.style.overflow = previousOverflow;
      // Seed once from a restored scroll position or a deep link, before reveal.
      state.maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const cue = chapters.find(c => c.id === window.location.hash.slice(1));
      state.targetProgress = cue ? getChapterDestination(cue.id) : state.maxScroll > 0 ? clamp(window.scrollY / state.maxScroll) : 0;
      state.currentProgress = state.targetProgress;
      state.framePosition = getVideoTime(state.currentProgress) * sourceFps(source);
      enabled = true;
      resize();
      render(state.framePosition);
      paint();
      paintDebug();
      setReady(true);
    }
    release.current = start;
    resize();
    // A single uniform decode size for this visit. No duplicate bitmaps, no
    // decoding on scroll or resize; resizing only updates drawing geometry.
    const decodeSize = getDecodeDimensions(geometry.width, dpr);
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motion.addEventListener("change", onMotionChange);

    let nextIndex = 0;
    async function worker() {
      while (!disposed && nextIndex < frameConfig.count) {
        const index = nextIndex++;
        const timeout = new AbortController();
        const timer = setTimeout(() => timeout.abort(), 30000);
        try {
          const response = await fetch(getFramePath(index), { signal: AbortSignal.any([controller.signal, timeout.signal]) });
          if (!response.ok) throw new Error(`Frame ${index + 1}: ${response.status}`);
          const bitmap = await createImageBitmap(await response.blob(), {
            resizeWidth: decodeSize.width, resizeHeight: decodeSize.height, resizeQuality: "high",
          });
          if (disposed) { bitmap.close(); return; }
          images[index] = bitmap;
          loaded++;
          if (index === 0) draw(getFrameSample(0));
        } catch {
          if (disposed) return;
          failed++;
        } finally { clearTimeout(timer); }
        if (!disposed) setLoading({ loaded, total: frameConfig.count, failed, settled: false });
      }
    }
    function loadFrames() {
      source = "frames";
      stage!.dataset.frameSource = frameConfig.directory;
      stage!.dataset.decodeSize = `${decodeSize.width}x${decodeSize.height}`;
      setLoading({ loaded: 0, total: frameConfig.count, failed: 0, settled: false });
      void Promise.all(Array.from({ length: 6 }, worker)).then(() => {
        if (disposed) return;
        setLoading({ loaded, total: frameConfig.count, failed, settled: true });
        if (!failed) start();
      });
    }

    const waitFor = (event: string, ms: number) => new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { video.removeEventListener(event, done); reject(new Error(`${event} timeout`)); }, ms);
      function done() { clearTimeout(timer); resolve(); }
      video.addEventListener(event, done, { once: true });
    });
    async function loadVideo() {
      stage!.dataset.frameSource = frameConfig.video.src;
      // Fetch the whole file into a blob first: seeking inside a buffered blob is near
      // instant, while range requests over the network would turn the scrub into a slideshow.
      // Own abort signal: a stalled video must never cancel the fallback frame requests.
      const stalled = new AbortController();
      const timeout = setTimeout(() => stalled.abort(), 25000);
      const response = await fetch(frameConfig.video.src, { signal: AbortSignal.any([controller.signal, stalled.signal]) });
      if (!response.ok || !response.body) throw new Error(`Video: ${response.status}`);
      const total = Number(response.headers.get("content-length")) || frameConfig.video.bytes;
      const reader = response.body.getReader();
      const chunks: BlobPart[] = [];
      let received = 0, lastPercent = -1;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        const percent = Math.min(99, Math.floor(received / total * 100));
        if (percent !== lastPercent) { lastPercent = percent; setLoading({ loaded: percent, total: 100, failed: 0, settled: false }); }
      }
      clearTimeout(timeout);
      if (disposed) return;
      videoUrl = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
      video.src = videoUrl;
      video.load();
      await waitFor("loadeddata", 10000);
      // Seek probe: a browser that cannot decode arbitrary frames fast enough gets the
      // image sequence instead of a stuttering scrub.
      const timings: number[] = [];
      for (const frame of [60, 200, 20, 150, 110]) {
        const began = performance.now();
        video.currentTime = (frame + .5) / frameConfig.video.fps;
        await waitFor("seeked", 2000);
        timings.push(performance.now() - began);
      }
      if (timings.sort((a, b) => a - b)[2] > 50) throw new Error("Video seeking too slow");
      if (disposed) return;
      video.addEventListener("seeked", onSeeked);
      shownFrame = -1;
      seekingFrame = null;
      videoReady = true;
      setLoading({ loaded: 100, total: 100, failed: 0, settled: true });
      start();
    }
    // iOS will not paint a frame from a video that has never played, so nudge it once
    // on the first interaction, pause immediately, and repaint the requested frame.
    function unlockVideo() {
      if (source !== "video" || disposed) return;
      video.play().then(() => {
        video.pause();
        shownFrame = -1;
        seekingFrame = null;
        seekVideo(wantedFrame);
      }).catch(() => {});
    }
    const unlockEvents = ["touchstart", "pointerdown", "wheel", "keydown"] as const;
    if (navigator.maxTouchPoints > 0) unlockEvents.forEach(event => window.addEventListener(event, unlockVideo, { once: true, passive: true }));

    Object.assign(video, { muted: true, playsInline: true, preload: "auto", disablePictureInPicture: true });
    video.setAttribute("aria-hidden", "true");
    // Kept in the document (but invisible) because some mobile browsers do not decode detached videos.
    video.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
    container.appendChild(video);
    if (source === "video") void loadVideo().catch(() => {
      if (disposed) return;
      video.removeEventListener("seeked", onSeeked);
      video.removeAttribute("src");
      video.load();
      loadFrames();
    });
    else loadFrames();
    return () => {
      disposed = true;
      controller.abort();
      cancelAnimationFrame(state.animationFrameId);
      images.forEach(image => image?.close());
      itemTimers.forEach(timer => clearTimeout(timer));
      video.removeEventListener("seeked", onSeeked);
      video.removeAttribute("src");
      video.load();
      video.remove();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      unlockEvents.forEach(event => window.removeEventListener(event, unlockVideo));
      state.context = null;
      seek.current = () => {};
      release.current = () => {};
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [attempt]);

  const retry = () => { setReady(false); setLoading({ loaded: 0, total: 100, failed: 0, settled: false }); setAttempt(value => value + 1); };
  return { root, canvas, meter, chapterCounter, debug, loading, ready, retry,
    goTo: (progress: number) => seek.current(progress), continueLoading: () => release.current() };
}
