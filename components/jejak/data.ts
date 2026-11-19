/* Copy uses two inline marks, rendered by <Rich>: **emphasis** and `code_token`. */

export const NAV = {
  home: { href: "/", label: "Back to Portfolio" },
  prev: { href: "/projects/padu", label: "PADU" },
  next: { href: "/projects/fyp-project", label: "FYP" },
  tag: "Hackathon · 2026",
} as const;

/* ── The journey: one mountain, climbed from the valley floor to the summit ── */

export type Scene = {
  key: string;
  /** Where on the trail: the stage name in the elevation profile. */
  label: string;
  /** What the section covers. */
  topic: string;
  place: string;
  /** Illustrative altitude for the elevation profile, in metres. */
  alt: number;
};

export const SCENES: Scene[] = [
  { key: "trailhead", label: "Trailhead", topic: "Overview", place: "Valley floor", alt: 420 },
  { key: "gate", label: "Gate", topic: "Challenge & Mission", place: "Trail entrance", alt: 560 },
  { key: "forest", label: "Forest", topic: "Journey", place: "Forest trail", alt: 910 },
  { key: "river", label: "River", topic: "Capabilities", place: "Forest river", alt: 1240 },
  { key: "climb", label: "Climb", topic: "Experience", place: "Rocky hillside", alt: 1610 },
  { key: "falls", label: "Falls", topic: "Intelligence", place: "Hidden falls", alt: 1880 },
  { key: "ascent", label: "Ascent", topic: "Outcome", place: "High ridge", alt: 2240 },
  { key: "summit", label: "Summit", topic: "Achievement", place: "Mountain summit", alt: 2486 },
];

/* The scroll gap between scene i and i + 1, named after what the camera passes through. */
export const GAPS = ["path", "gate", "canopy", "spray", "clouds", "mist", "flock"] as const;
export type Gap = (typeof GAPS)[number];

/* ── 01 Trailhead · Overview ────────────────────────────────── */

export const HERO = {
  event: "ASEAN GeoAI Fusion 2026",
  name: "JEJAK",
  tagline: "GeoAI-Powered Hiking Safety App",
  intro:
    "JEJAK is a React Native mobile app that predicts **communication dead zones** along hiking trails, lets hikers download offline trail packs before setting off, and records GPS trajectories in the background so search-and-rescue teams get a real last-known location once coverage returns.",
  cue: "Scroll to start the climb",
};

export const STATS = [
  { value: "GeoAI", label: "Core Technology" },
  { value: "Offline", label: "Trail Packs" },
  { value: "86", label: "Tests Passing" },
  { value: "2026", label: "Event Year" },
];

/* ── 02 Gate · Challenge & Mission ──────────────────────────── */

export const CHALLENGE = {
  label: "Challenge & Mission",
  heading: ["What happens", "when the signal", "disappears?"],
  problemLabel: "The Problem",
  problem:
    "Hikers lose signal **without warning**. SAR teams comb **oversized search areas** hunting for a last-known location. And authorities plan new infrastructure **completely blind**.",
  tags: ["No coverage warning", "Oversized search areas", "Blind infrastructure planning"],
  missionLabel: "Our Mission",
};

export const MISSION = [
  { title: "Predict", desc: "Classify every trail segment — terrain, vegetation, telecom data — as `likely_covered`, `uncertain`, or `predicted_gap`." },
  { title: "Empower", desc: "Downloadable routes, offline maps, and a warning before hikers enter a predicted dead zone." },
  { title: "Assist", desc: "Background GPS + sync the last-known location the moment coverage returns, for real SAR intelligence." },
];

/* ── 03 Forest · Journey: 5-Phase Agenda ────────────────────── */

export const PHASES_COPY = {
  label: "Journey",
  title: "5-Phase Agenda",
  heading: ["The route", "behind JEJAK."],
};

export const PHASES = [
  { title: "Data Collection & Preparation", desc: "Collect hiking-trail, terrain, vegetation, mobile-coverage, and cellular-infrastructure data. Align and catalogue datasets from OpenStreetMap, Copernicus DEM, ESA WorldCover, FAO mobile coverage, Ookla, and OpenCellID, then preprocess consistent features for model training." },
  { title: "GeoAI Model Contract", desc: "Define a discriminated-union prediction contract (`route_only` / `fixture` / `model_backed`) so the app never confuses demo geometry with a real trained-model prediction, ready to plug in a GeoAI model once one exists." },
  { title: "Platform Development", desc: "Build the React Native (Expo) app that lets hikers download routes, connectivity predictions, and offline maps before their hike — with gated gap warnings and background GPS trajectory recording when offline." },
  { title: "System Integration", desc: "Sync the app to a backend via a switchable HTTP/fixture repository, with persisted retry backoff and real network-state stamping so sync survives spotty connectivity and app restarts." },
  { title: "Testing & Validation", desc: "86 automated tests (Jest + React Native Testing Library) gated by CI on every push." },
];

/* ── 04 River · Capabilities ────────────────────────────────── */

export const FEATURES_COPY = {
  label: "Capabilities",
  title: "What JEJAK Delivers",
  heading: ["What JEJAK", "delivers."],
};

export const FEATURES = [
  { code: "Predict", title: "Predictive Dead-Zone Warnings", desc: "Warnings only fire when a trail pack is `approved_for_mobile_warning` AND the segment is `warning_eligible` — a double-gate so unapproved model output never reaches a hiker." },
  { code: "Offline", title: "Offline Trail Packs", desc: "Download routes, connectivity predictions, and offline maps before setting off — the app works with zero signal on the trail." },
  { code: "GPS", title: "Background GPS Recording", desc: "Opt-in background location tracking via TaskManager that survives app restarts, re-deriving the active session from SQLite on every wake-up." },
  { code: "Sync", title: "Retry-Safe Sync", desc: "Persisted exponential backoff and real observed network-state stamping mean sync survives spotty connectivity without hammering the server." },
  { code: "Testing", title: "Tested & CI-Gated", desc: "86 automated tests (Jest + React Native Testing Library) with lint, typecheck, and test running on every push via GitHub Actions." },
  { code: "Data", title: "Honest Data Staging", desc: "Every trail pack is explicitly labelled `route_only`, `fixture`, or `model_backed` — fixture demo data never pretends to be a real prediction." },
];

/* ── 05 Climb · Experience: See It In Action ────────────────── */

export const SCREENS_COPY = {
  label: "Experience",
  title: "See It In Action",
  heading: ["See JEJAK", "in action."],
  hint: "Klik mana-mana gambar untuk paparan penuh & penerangan",
  open: "View full screen",
};

export type Screenshot = { label: string; src: string; alt: string; caption: string; description: string };

export const SCREENSHOTS: Screenshot[] = [
  { label: "Splash", src: "/jejak/jejak-splash.png", alt: "JEJAK mobile splash screen", caption: "Loading — splash screen", description: "Skrin permulaan app — pin lokasi 3D di atas disc progress bar animasi 0–100%, dengan branding JEJAK & tagline \"GeoAI Connectivity Intelligence\", sebelum masuk ke skrin login." },
  { label: "Login", src: "/jejak/jejak-login.png", alt: "JEJAK mobile login screen", caption: "Login — Ready for the trail?", description: "Skrin login dengan animasi Lottie hiker berjalan di latar belakang, kad glass \"Ready for the trail?\" dengan butang Sign In & Continue as Guest — dilabel jujur \"Demo mode — no account required yet\"." },
  { label: "App Info Home", src: "/jejak/jejak-info-home.png", alt: "JEJAK mobile App Info Home tab", caption: "App Info — Home (objective & agenda)", description: "Skrin \"How It Works\" mod Home — objektif projek, badge Offline-Ready/Real-time Sync/GeoAI Powered, dan agenda kerja (work plan) mengikut fasa." },
  { label: "App Info Map", src: "/jejak/jejak-info-map.png", alt: "JEJAK mobile App Info Map tab", caption: "App Info — Map (feature carousel)", description: "Skrin \"How It Works\" mod Map — carousel swipe 5 ciri utama app (Pre-Hike download, Live Hike System, dsb), setiap kad ada nombor & deskripsi \"Now Viewing\"." },
  { label: "Home", src: "/jejak/jejak-tab-home.png", alt: "JEJAK mobile Home tab", caption: "Home — readiness dashboard", description: "Tab Home memaparkan \"hiker's log\" sebenar — trails ready, packs offline, active hike, status connectivity & last synced — semuanya baca terus dari sistem sebenar (bukan placeholder statik)." },
  { label: "Trails", src: "/jejak/jejak-tab-trails.png", alt: "JEJAK mobile Trails tab", caption: "Trails — senarai laluan", description: "Tab Trails papar senarai laluan pendakian ikut negeri (Perak, Selangor, Johor) lengkap dengan jarak & tahap kesukaran, dilabel jujur \"Fixture data only — planning predictions, not confirmed coverage\"." },
  { label: "Active Hike", src: "/jejak/jejak-tab-active-hike.png", alt: "JEJAK mobile Active Hike tab", caption: "Active Hike — sedia untuk mula", description: "Selepas offline pack dimuat turun, tab Active Hike sedia dengan butang \"Start hike\" untuk mula rakam GPS di latar belakang sepanjang pendakian." },
  { label: "Downloads", src: "/jejak/jejak-tab-downloads.png", alt: "JEJAK mobile Downloads tab", caption: "Downloads — pek offline", description: "Tab Downloads senarai semua trail pack yang disimpan di peranti, dengan status model version & bila ia dimuat turun, boleh dipadam terus dari sini." },
];

/* ── 06 Falls · GeoAI Intelligence ──────────────────────────── */

export const DISCOVERY = {
  label: "Intelligence",
  title: "What the trail knows",
  heading: ["Know the trail", "before you lose it."],
  lead:
    "Behind every trail pack is a GeoAI pipeline: terrain, vegetation and telecom data fused into a **coverage prediction for each segment** of the route, staged honestly so a hiker always knows what kind of answer they are holding.",
};

export const COVERAGE = [
  { code: "likely_covered", tone: "ok", desc: "Signal expected along this segment." },
  { code: "uncertain", tone: "warn", desc: "Mixed evidence. Plan as if it could drop." },
  { code: "predicted_gap", tone: "gap", desc: "Dead zone ahead. JEJAK warns before you enter it." },
] as const;

export const SOURCES = ["OpenStreetMap", "Copernicus DEM", "ESA WorldCover", "FAO mobile coverage", "Ookla", "OpenCellID"];

export const STAGING = [
  { code: "route_only", desc: "Geometry only, no prediction." },
  { code: "fixture", desc: "Demo data, labelled as demo." },
  { code: "model_backed", desc: "A real GeoAI model prediction." },
];

/* ── 07 Ascent · Outcome ────────────────────────────────────── */

export const OUTCOME = {
  label: "Outcome",
  heading: ["Connectivity", "awareness before", "the signal disappears."],
  text:
    "JEJAK gives hikers offline connectivity awareness — gated dead-zone warnings, downloadable trail packs, and background GPS recording that syncs a real last-known location back the moment coverage returns. The app is honest about what's real: every trail pack is explicitly staged as `route_only`, `fixture`, or `model_backed`, so demo data never pretends to be a genuine GeoAI prediction.",
  meta: "Expected Outcome · Consumer Empowerment",
};

/* ── 08 Summit · Achievement + Tech Stack + Project Info ────── */

export const SUMMIT = {
  label: "Achievement",
  heading: ["The summit,", "with a trace", "left behind."],
  text:
    "From the valley floor to the top, JEJAK walks beside the hiker: it warns before the signal drops, keeps working offline, and leaves a GPS trace that brings search and rescue straight to the last-known location.",
};

/* ── Ending · the hiker looks back over the climb ────────────── */

export const ENDING = {
  label: "Journey completed",
  heading: ["Every trail", "leaves a jejak."],
  meaning: { word: "jejak", kind: "n.", senses: ["a trail", "a journey", "a trace"] },
};

export const TECH = [
  "Expo SDK 54", "React Native 0.81", "Expo Router", "MapLibre",
  "SQLite", "Zod", "Jest + RNTL", "GitHub Actions CI",
];

export const INFO = [
  { label: "Period", value: "2026" },
  { label: "Event", value: "ASEAN GeoAI Fusion 2026" },
  { label: "Role", value: "Contributor" },
  { label: "Platform", value: "React Native (Expo)" },
  { label: "Tests", value: "86/86 passing (CI)" },
  { label: "Status", value: "Completed" },
];

export const pad = (n: number) => String(n).padStart(2, "0");
