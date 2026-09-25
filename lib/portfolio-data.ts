// Professional content preserved from the original portfolio.
export const email = "izzatzamri01@gmail.com";
export const socialLinks = { github: "https://github.com/izzatimran", linkedin: "https://linkedin.com" };
// The original LinkedIn link is generic; no personal profile or resume was supplied.
export const experience = [
  {
    "role": "Web & Frontend Developer",
    "company": "Unit PADU, Kementerian Ekonomi",
    "loc": "Putrajaya",
    "period": "2025 – Present",
    "accent": "#4f46e5",
    "accentRaw": "79,70,229",
    "current": true,
    "points": [
      "Built Portal Analitik, Portal PADU & Portal Panduan Pengguna with Next.js & Tailwind CSS",
      "Integrated Strapi headless CMS with RESTful APIs for dynamic content",
      "Developed AI chatbot for MyINFO & Portal PADU using Vertex AI",
      "Implemented Google OAuth 2.0 for secure authentication",
      "Built an internal Unit PADU system with Next.js, PostgreSQL & Prisma ORM",
      "Developed and tested REST API endpoints for government agency data integration, including controller development, request DTOs, and role-based permission guards using NestJS and Prisma ORM. Conducted API testing via Postman to validate endpoint functionality, authentication, authorization, and response accuracy.",
      "Collaborated with designers & stakeholders on UI/UX consistency",
      "Managed source code via Git (OSDEC)"
    ]
  },
  {
    "role": "IT Development Intern",
    "company": "SB Tape Group Sdn Bhd",
    "loc": "Seri Kembangan, Selangor",
    "period": "2025",
    "accent": "#7c3aed",
    "accentRaw": "124,58,237",
    "current": false,
    "points": [
      "Developed IOSS, ICAR & SCAR modules using VB.Net & ASP.NET",
      "Built weblogin, CRUD operations & report generation",
      "Designed system flowcharts using Draw.io",
      "Participated in user requirement meetings"
    ]
  },
  {
    "role": "IT Development Intern",
    "company": "MAP2U Sdn Bhd",
    "loc": "Nilai, Negeri Sembilan",
    "period": "2023",
    "accent": "#0891b2",
    "accentRaw": "8,145,178",
    "current": false,
    "points": [
      "Customised template-based websites & built system components",
      "Developed data tables & filters for E-idaman project",
      "Supported UI/UX design for Jabatan Pengaliran Saliran (JPS)"
    ]
  }
];

export const projects = [
  {
    "title": "Portal PADU",
    "org": "Kementerian Ekonomi Malaysia",
    "period": "2025 – Present",
    "role": "Lead Frontend Dev",
    "desc": "Lead frontend development for Malaysia's national socioeconomic portal. Built 20+ animated pages including infographic dashboards, 3D carousel timelines, and AI-powered chatbot via Vertex AI.",
    "highlights": [
      "20+ animated page modules",
      "3D carousel timeline (SejarahPaduPage)",
      "PADUServices animated infographics",
      "KolaborasiStrategik agency grid 14+",
      "Media & press release pages",
      "Responsive across all breakpoints",
      "Framer Motion entrance animations",
      "HeroUI component library"
    ],
    "tags": [
      "Next.js 15",
      "Tailwind CSS",
      "Vertex AI",
      "HeroUI",
      "Framer Motion"
    ],
    "icon": "🇲🇾",
    "accent": "#4f46e5",
    "accentRaw": "79,70,229",
    "status": "Live",
    "statusColor": "#16a34a",
    "href": "/projects/padu",
    "preview": "/homeportalawam.png"
  },
  {
    "title": "MyINFO & PADU Chatbot",
    "org": "Unit PADU, Kementerian Ekonomi",
    "period": "2025 – Present",
    "role": "AI Integration Developer",
    "desc": "AI-powered chatbot built using Google Vertex AI Conversational Agents for both MyINFO and Portal PADU. Features sophisticated NLU, custom Lottie robot animation, shadow DOM CSS injection, and auto-refresh on session close.",
    "highlights": [
      "Google Vertex AI Conversational Agents",
      "Natural language understanding (NLU)",
      "Deployed on MyINFO & Portal PADU",
      "Custom Lottie robot animation icon",
      "Shadow DOM CSS injection",
      "Auto-refresh on chat session close",
      "Dialogflow intent routing",
      "Chip text display & welcome intent"
    ],
    "tags": [
      "Vertex AI",
      "Dialogflow",
      "LottieFiles",
      "TypeScript",
      "Next.js"
    ],
    "icon": "🤖",
    "accent": "#0891b2",
    "accentRaw": "8,145,178",
    "status": "Live",
    "statusColor": "#16a34a",
    "internal": true,
    "href": "/projects/padu",
    "preview": "/chatbotmyinfo.jpeg"
  },
  {
    "title": "Portal Analitik",
    "org": "Kementerian Ekonomi",
    "period": "2025",
    "role": "Frontend Developer",
    "desc": "Analytics portal for government data insights. Developed interactive chart dashboards, advanced data filtering system, and real-time KPI monitoring panels for policy analysts with REST API integration.",
    "highlights": [
      "Interactive chart dashboards",
      "KPI monitoring panels",
      "Advanced data filtering system",
      "REST API integration",
      "Policy analyst-focused UI",
      "Real-time data rendering"
    ],
    "tags": [
      "Next.js",
      "React",
      "Tailwind CSS",
      "REST API"
    ],
    "icon": "📊",
    "accent": "#7c3aed",
    "accentRaw": "124,58,237",
    "status": "Live",
    "statusColor": "#16a34a",
    "internal": true,
    "href": "/projects/padu",
    "preview": "/homeanalitik.jpeg"
  },
  {
    "title": "Portal Panduan Pengguna",
    "org": "Kementerian Ekonomi",
    "period": "2025",
    "role": "Frontend Developer",
    "desc": "Government staff portal with dynamic content management via Strapi headless CMS. Implemented secure Google OAuth 2.0 authentication and RESTful API integration for structured user guide delivery.",
    "highlights": [
      "Strapi headless CMS integration",
      "Google OAuth 2.0 authentication",
      "Dynamic content per slug",
      "Staff role-based access control",
      "RESTful API content fetching",
      "SEO optimized URL structure"
    ],
    "tags": [
      "Next.js",
      "Strapi CMS",
      "Google OAuth",
      "REST API"
    ],
    "icon": "📖",
    "accent": "#0891b2",
    "accentRaw": "8,145,178",
    "status": "Live",
    "statusColor": "#16a34a",
    "internal": true,
    "href": "/projects/padu",
    "preview": "/homepanduan.png"
  },
  {
    "title": "Unit PADU Internal System",
    "org": "Unit PADU, Kementerian Ekonomi",
    "period": "2025 – Present",
    "role": "Full-Stack Developer",
    "desc": "Internal workflow management system for Unit PADU, integrating a responsive Next.js front-end with structured PostgreSQL data models via Prisma ORM to support daily operational efficiency.",
    "highlights": [
      "Next.js + Prisma ORM stack",
      "PostgreSQL structured data models",
      "Internal workflow management",
      "Operational efficiency tooling",
      "Responsive internal dashboard UI",
      "Role-based internal access"
    ],
    "tags": [
      "Next.js",
      "PostgreSQL",
      "Prisma ORM",
      "Tailwind CSS"
    ],
    "icon": "🗂️",
    "accent": "#4f46e5",
    "accentRaw": "79,70,229",
    "status": "Live",
    "statusColor": "#16a34a",
    "internal": true,
    "href": "/projects/padu",
    "preview": null
  },
  {
    "title": "Agency Data Integration API",
    "org": "Unit PADU, Kementerian Ekonomi",
    "period": "2025 – Present",
    "role": "Backend Developer",
    "desc": "Developed and tested REST API endpoints for government agency data integration, including controller development, request DTOs, and role-based permission guards using NestJS and Prisma ORM. Conducted API testing via Postman to validate endpoint functionality, authentication, authorization, and response accuracy.",
    "highlights": [
      "REST API endpoints for agency data integration",
      "NestJS controller development",
      "Request DTOs for input validation",
      "Role-based permission guards",
      "Prisma ORM data access",
      "Postman testing of authentication, authorization & responses"
    ],
    "tags": [
      "NestJS",
      "Prisma ORM",
      "TypeScript",
      "Postman"
    ],
    "icon": "🔌",
    "accent": "#d97706",
    "accentRaw": "217,119,6",
    "status": "Active",
    "statusColor": "#16a34a",
    "internal": true,
    "href": "/projects/padu",
    "preview": null
  },
  {
    "title": "Smart Ticket System",
    "org": "Final Year Project · UiTM",
    "period": "2025",
    "role": "Full-Stack Developer",
    "desc": "Full-stack national football ticket booking system with a custom real-time seat allocation algorithm for Bukit Jalil National Stadium. Built with Laravel, deployed on InfinityFree hosting.",
    "highlights": [
      "Real-time seat allocation algorithm",
      "Interactive Bukit Jalil SVG map",
      "Full-stack Laravel + MySQL",
      "CSRF protection & secure checkout",
      "Admin CRUD dashboard",
      "E-ticket generation with QR code",
      "Mobile-first responsive design",
      "Deployed on InfinityFree hosting"
    ],
    "tags": [
      "Laravel",
      "MySQL",
      "PHP",
      "InfinityFree"
    ],
    "icon": "🏟️",
    "accent": "#d97706",
    "accentRaw": "217,119,6",
    "status": "Completed",
    "statusColor": "#0891b2",
    "href": "/projects/fyp-project",
    "preview": "/fypproject.jpeg"
  },
  {
    "title": "JEJAK",
    "org": "ASEAN GeoAI Fusion 2026 · Hackathon",
    "period": "2026",
    "role": "Contributor",
    "desc": "React Native (Expo) hiking safety app that predicts communication dead zones along trails, lets hikers download offline trail packs, and records GPS trajectories in the background so SAR teams get a real last-known location once coverage returns.",
    "highlights": [
      "Predictive dead-zone warnings (gated)",
      "Offline trail packs & maps",
      "Background GPS recording",
      "Retry-safe sync with backoff",
      "86 automated tests, CI-gated",
      "Honest route_only/fixture/model_backed staging"
    ],
    "tags": [
      "React Native",
      "Expo",
      "GeoAI",
      "Search & Rescue"
    ],
    "icon": "🧭",
    "accent": "#0d9488",
    "accentRaw": "13,148,136",
    "status": "Hackathon",
    "statusColor": "#0d9488",
    "href": "/projects/jejak",
    "preview": "/herosectiontrails.jpg"
  }
];

export const skillGroups = [
  {
    "label": "Interface",
    "items": [
      "Next.js 15",
      "React",
      "React Native",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "HeroUI"
    ]
  },
  {
    "label": "Systems & data",
    "items": [
      "Laravel",
      "PHP",
      "ASP.NET",
      "NestJS",
      "MySQL",
      "PostgreSQL",
      "Prisma ORM",
      "Strapi"
    ]
  },
  {
    "label": "Tools & intelligence",
    "items": [
      "Vertex AI",
      "Google OAuth",
      "Git",
      "Postman",
      "Figma",
      "LottieFiles",
      "Expo"
    ]
  }
];
