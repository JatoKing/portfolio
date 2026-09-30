/* Smart Ticket System — all page copy lives here so sections stay presentational. */
import {
  Armchair, Construction, Repeat,
  Map, Zap, Lock, LayoutDashboard, Smartphone, Ticket,
  type LucideIcon,
} from "lucide-react";

export const STADIUM_SRC = "/stadium.jpg";

export const HERO_INTRO =
  "A full-stack national football ticket booking system featuring a real-time seat allocation algorithm for Bukit Jalil National Stadium. Built with Laravel & deployed on InfinityFree.";

export const HERO_STATS = [
  { num: "87K+", label: "Seat Capacity" },
  { num: "Laravel", label: "Backend" },
  { num: "MySQL", label: "Database" },
  { num: "A", label: "Final Grade" },
];

export const TICKER_ITEMS = [
  "Bukit Jalil National Stadium",
  "Seating Capacity: 87,411",
  "Real-time Seat Allocation",
  "Secure Booking System",
  "Mobile Responsive",
  "Final Year Project — Grade A",
];

export const PROBLEM_QUOTE =
  "In recent years, there has often been confusion regarding seating arrangements in open seating areas, raising questions about the purpose of seat numbers on tickets. Many spectators are forced to sit on stairs or cement due to seating problems, which not only causes discomfort but also obstructs movement within the venue. Despite the recurring nature of this issue, particularly in football matches, a clear solution has yet to be implemented.";

export const PROBLEM_SOURCE = "Saiful, 2023";

export const PROBLEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Armchair,
    title: "Seat Confusion",
    desc: "Spectators frequently disregard assigned seats on tickets, occupying other seats for personal convenience — causing widespread disorder.",
  },
  {
    icon: Construction,
    title: "Obstructed Pathways",
    desc: "Many spectators are forced to sit on stairs or cement due to seating conflicts, obstructing movement and creating safety hazards within the venue.",
  },
  {
    icon: Repeat,
    title: "Recurring Issue",
    desc: "The problem recurs particularly at football matches, yet no clear systematic solution had been implemented (Saiful, 2023).",
  },
];

export const OBJECTIVES = [
  {
    num: "01",
    title: "Design",
    desc: "To design a smart ticketing system that provides an efficient and user-friendly platform for purchasing football tickets.",
  },
  {
    num: "02",
    title: "Develop",
    desc: "To develop a web-based application that integrates a seat-allocation algorithm, allowing users to select preferred seats and access real-time match schedules.",
  },
  {
    num: "03",
    title: "Test",
    desc: "To test the functionality of the system through simulated scenarios and real-world use cases to ensure reliability and customer satisfaction.",
  },
];

export interface Screenshot {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Short name shown large; `caption` keeps the original full line. */
  label: string;
  caption: string;
  description: string;
  fit: "cover" | "contain";
}

export const SCREENSHOTS: Screenshot[] = [
  {
    src: "/fypproject.jpeg",
    width: 1919,
    height: 893,
    alt: "Smart Ticket homepage",
    label: "Homepage",
    caption: "Homepage — Stadium overview & ticket categories",
    description:
      "Halaman utama Smart Ticket System memaparkan overview Stadium Bukit Jalil dengan butiran perlawanan yang akan datang. Pengguna boleh melihat kategori tiket yang tersedia — Tribun, Biasa, dan VIP — beserta harga dan kapasiti setiap seksyen. Reka bentuk responsif memastikan pengalaman terbaik di semua peranti.",
    fit: "cover",
  },
  {
    src: "/fypproject1.jpeg",
    width: 1919,
    height: 892,
    alt: "Smart Ticket seat selection",
    label: "Seat Selection",
    caption: "Seat Selection — Real-time Bukit Jalil map",
    description:
      "Paparan pemilihan kerusi menggunakan peta SVG interaktif Stadium Bukit Jalil yang dibina khas. Setiap seksyen dikodkan warna mengikut tahap harga. Algoritma pengesahan masa nyata memastikan tiada double-booking berlaku — kerusi yang telah dibeli dikunci secara optimistic locking di peringkat pangkalan data MySQL.",
    fit: "cover",
  },
  {
    src: "/fypproject2.jpeg",
    width: 748,
    height: 767,
    alt: "Smart Ticket booking confirmation",
    label: "Booking Confirmation",
    caption: "Booking Confirmation — Order summary & e-ticket",
    description:
      "Skrin pengesahan tempahan memaparkan ringkasan lengkap pesanan termasuk maklumat perlawanan, seksyen kerusi yang dipilih, jumlah bayaran, dan nombor rujukan unik. E-tiket digital dijana secara automatik dengan QR code untuk kemudahan pengesahan di pintu masuk stadium.",
    fit: "contain",
  },
];

export const SCREENSHOT_HINT = "Klik mana-mana gambar untuk paparan penuh & penerangan";

export const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Map,             title: "Interactive Seat Map", desc: "Custom SVG map of Bukit Jalil National Stadium with real-time availability rendering per section." },
  { icon: Zap,             title: "Real-time Allocation", desc: "Custom seat allocation algorithm prevents double-booking with optimistic locking at the database level." },
  { icon: Lock,            title: "Secure Checkout",      desc: "Session-based booking flow with CSRF protection and input validation throughout the Laravel backend." },
  { icon: LayoutDashboard, title: "Admin Dashboard",      desc: "Full CRUD panel for match management, seat configuration, and booking report generation." },
  { icon: Smartphone,      title: "Responsive UI",        desc: "Mobile-first design with Blade templates — works seamlessly on phones, tablets and desktops." },
  { icon: Ticket,          title: "E-Ticket Generation",  desc: "Auto-generated digital tickets with unique booking reference codes per confirmed purchase." },
];

/* Roles are taken from how each tool is described elsewhere on this page. */
export const TECH_STACK = [
  { name: "Laravel",      role: "Backend" },
  { name: "PHP",          role: "Language" },
  { name: "MySQL",        role: "Database" },
  { name: "Blade",        role: "Templates" },
  { name: "Bootstrap",    role: "UI styling" },
  { name: "JavaScript",   role: "Client scripting" },
  { name: "InfinityFree", role: "Deployment" },
];

export const PROJECT_STATS = [
  { big: "2025", label: "Period",       value: "2025" },
  { big: "FYP",  label: "Project Type", value: "Final Year Project (FYP)" },
  { big: "UiTM", label: "Institution",  value: "UiTM Shah Alam" },
  { big: "A",    label: "Final Grade",  value: "A — Distinction" },
];

export const NAV = {
  prev: { href: "/projects/jejak", label: "JEJAK" },
  next: { href: "/projects/padu", label: "PADU" },
  home: { href: "/", label: "Back to Portfolio" },
};
