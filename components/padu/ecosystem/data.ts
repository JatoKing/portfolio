/*
 * Content and layout of the PADU data ecosystem: five sources feed the PADU data core,
 * which holds nine profile parameters and powers four outcomes. All copy is in Bahasa
 * Melayu, as PADU itself publishes it.
 * Ground positions are in world units, x to the right and z toward the viewer; the core
 * sits at the origin, the sources on an arc behind it and the outcomes on an arc in front.
 */

export type EcoKind = "source" | "core" | "param" | "outcome";

export interface EcoNode {
  id: string;
  kind: EcoKind;
  /** Name as labelled in the scene. */
  name: string;
  blurb: string;
  /** Position in its group, from 1. */
  idx: number;
}

export interface EcoPlace extends EcoNode {
  /** Ground position (x, z). */
  at: [number, number];
}

export interface EcoOutcome extends EcoPlace {
  /** The landmark that stands for the outcome. */
  facility: string;
}

/** (x, z) at `r` units from the core, `deg` counter-clockwise from +x seen from above. */
const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [+(r * Math.cos(a)).toFixed(2), +(-r * Math.sin(a)).toFixed(2)];
};

export const CORE: EcoNode & { full: string } = {
  id: "core",
  kind: "core",
  name: "PADU",
  full: "Pangkalan Data Utama",
  blurb:
    "Pangkalan data profil individu dan isi rumah warganegara serta pemastautin tetap di Malaysia.",
  idx: 1,
};

export const PROFILES = { value: "30.7 Juta", label: "profil individu" };

export const SOURCES: EcoPlace[] = [
  {
    id: "gov", name: "Kerajaan Persekutuan / Negeri",
    blurb: "Kementerian, jabatan dan agensi di peringkat persekutuan dan negeri.",
  },
  {
    id: "pbt", name: "Pihak Berkuasa Tempatan",
    blurb: "Dewan bandaraya, majlis perbandaran dan majlis daerah.",
  },
  {
    id: "statutory", name: "Badan Berkanun",
    blurb: "Badan yang ditubuhkan di bawah akta Parlimen atau enakmen negeri.",
  },
  {
    id: "org", name: "Pertubuhan",
    blurb: "Pertubuhan dan persatuan berdaftar.",
  },
  {
    id: "citizens", name: "Rakyat",
    blurb: "Warganegara dan pemastautin tetap yang mengemas kini dan mengesahkan profil mereka sendiri.",
  },
].map((s, i) => ({ ...s, kind: "source" as const, idx: i + 1, at: polar(19, 162 - i * 36) }));

export const PARAMS: EcoNode[] = [
  { id: "demographics", name: "Demografi" },
  { id: "address", name: "Alamat" },
  { id: "employment", name: "Pekerjaan" },
  { id: "income", name: "Pendapatan" },
  { id: "education", name: "Pendidikan" },
  { id: "vehicles", name: "Pemilikan Aset Kenderaan" },
  { id: "protection", name: "Perlindungan Sosial" },
  { id: "utilities", name: "Utiliti" },
  { id: "poverty", name: "Kemiskinan" },
].map((p, i) => ({
  ...p,
  kind: "param" as const,
  idx: i + 1,
  blurb: "Salah satu daripada sembilan parameter utama yang dirangkumi oleh profil individu dan isi rumah PADU.",
}));

export const OUTCOMES: EcoOutcome[] = [
  {
    id: "policy",
    name: "Peningkatan Kecekapan dan Keberkesanan Dasar",
    blurb: "Perancangan dan pelaksanaan dasar kerajaan ditambah baik berasaskan data rakyat yang tepat dan terkini.",
    facility: "Pusat Dasar dan Keputusan",
  },
  {
    id: "public",
    name: "Pengutamaan Kepentingan Awam",
    blurb: "Ketelusan dan akauntabiliti dalam pengurusan dan keselamatan data diperkukuh untuk kepentingan rakyat.",
    facility: "Pusat Kepentingan Awam",
  },
  {
    id: "digital",
    name: "Pemacu Inovasi Pendigitalan Perkhidmatan",
    blurb: "Transformasi digital perkhidmatan awam dipacu melalui integrasi data dan teknologi terkini.",
    facility: "Hab Inovasi Kerajaan Digital",
  },
  {
    id: "research",
    name: "Pengukuhan Hasil Kajian dan Penyelidikan",
    blurb: "Kajian dan penyelidikan yang lebih signifikan dihasilkan untuk pembangunan sosioekonomi negara.",
    facility: "Pusat Penyelidikan dan Analitik",
  },
].map((o, i) => ({ ...o, kind: "outcome" as const, idx: i + 1, at: polar(18, 210 + i * 40) }));

export const NODES: EcoNode[] = [CORE, ...SOURCES, ...PARAMS, ...OUTCOMES];
export const nodeById = (id: string) => NODES.find(n => n.id === id);

/** Camera presets for the view switcher. Distances are for a 16:9 stage; narrower stages
 *  pull back so the same ground stays in frame. Angles are OrbitControls' azimuth (0 =
 *  looking from the front, positive = swung to the right) and polar (from straight down). */
export const VIEWS = {
  overview: { label: "Keseluruhan", target: [0, 1, 3.6], azimuth: 0.42, polar: 0.98, distance: 84 },
  sources: { label: "Sumber", target: [-3.5, 1, -14], azimuth: 0.22, polar: 0.78, distance: 58 },
  core: { label: "PADU", target: [0, 4.6, 0], azimuth: 0.42, polar: 1.02, distance: 34 },
  outcomes: { label: "Keberhasilan", target: [-2.5, 1.5, 10.5], azimuth: 0.18, polar: 0.92, distance: 54 },
} as const;
export type ViewId = keyof typeof VIEWS;
