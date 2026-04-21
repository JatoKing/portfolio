"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

interface FileNode { name: string; type: "file"|"folder"; children?: FileNode[]; }

/* ─── Breakpoint Hook ─────────────────────────── */
function useBreakpoint() {
  const [bp, setBp] = useState<"mobile"|"tablet"|"desktop">("desktop");
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

const T = {
  bg:"#f8f7f4", bg2:"#f0ede8", card:"#ffffff",
  bdr:"rgba(0,0,0,.07)", bdr2:"rgba(0,0,0,.11)",
  tx:"#111111", tx2:"#555555", tx3:"#888888",
  ind:"#4f46e5", vio:"#7c3aed", cyn:"#0891b2",
  grn:"#16a34a", amb:"#d97706",
};

const CSS = `
  @property --sa{syntax:'<angle>';initial-value:0deg;inherits:false;}
  @property --ba{syntax:'<angle>';initial-value:0deg;inherits:false;}
  @property --ra{syntax:'<angle>';initial-value:0deg;inherits:false;}
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:${T.bg};}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-track{background:${T.bg};}
  ::-webkit-scrollbar-thumb{background:#4f46e5;border-radius:2px;}
  @keyframes gshift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes fadeup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes rippleOut{to{transform:scale(4);opacity:0;}}
  @keyframes shineSpin{to{--sa:360deg;}}
  @keyframes bspin{to{--ba:360deg;}}
  @keyframes rainbowSpin{to{--ra:360deg;}}
  @keyframes flowDash{from{stroke-dashoffset:60}to{stroke-dashoffset:0}}
  @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes pulseRing{0%{transform:scale(1);opacity:.9}70%{transform:scale(2.4);opacity:0}100%{opacity:0}}
  @keyframes slideInL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes flickerIn{0%{opacity:0}100%{opacity:1}}
  @keyframes spincw{to{transform:rotate(360deg)}}
  @keyframes spinccw{to{transform:rotate(-360deg)}}
  @keyframes retrogrid{0%{transform:perspective(500px) rotateX(35deg) translateY(0)}100%{transform:perspective(500px) rotateX(35deg) translateY(60px)}}
  @keyframes auroraMove{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  @keyframes warpPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.7;transform:scale(1.06)}}
  @keyframes gridPulse{0%,100%{opacity:.03}50%{opacity:.07}}
  @keyframes mqleft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes mqright{from{transform:translateX(-50%)}to{transform:translateX(0)}}
  @keyframes lineGrow{from{width:0}to{width:100%}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .gtext{background:linear-gradient(135deg,#4f46e5,#7c3aed,#0891b2,#4f46e5);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gshift 5s ease infinite;}
  .aurora-text{background:linear-gradient(270deg,#4f46e5,#7c3aed,#0891b2,#06b6d4,#4f46e5);background-size:400% 400%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:auroraMove 8s ease infinite;}
  .hl{transition:transform .22s ease,box-shadow .22s ease;}
  .hl:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.08);}
  .beam-line{stroke-dasharray:8 5;animation:flowDash 1.5s linear infinite;}
  .beam2{stroke-dasharray:8 5;animation:flowDash 2.2s linear infinite;}
  .beam3{stroke-dasharray:8 5;animation:flowDash 1s linear infinite;}

  /* Index row hover */
  .proj-index-row { transition: background .18s ease; cursor: pointer; }
  .proj-index-row:hover { background: rgba(255,255,255,0.7) !important; }
  .proj-index-row:hover .idx-arrow { transform: translateX(4px) translateY(-4px); opacity: 1 !important; }
  .idx-arrow { transition: transform .22s ease, opacity .22s ease; }

  /* Feature pill */
  .feat-pill { transition: background .18s, border-color .18s; }
  .feat-pill:hover { background: rgba(79,70,229,.08) !important; border-color: rgba(79,70,229,.25) !important; }

  /* Tech pill hover */
  .tech-pill-min { transition: background .18s, border-color .18s, color .18s; }
  .tech-pill-min:hover { background: rgba(79,70,229,.06) !important; border-color: rgba(79,70,229,.22) !important; }

  /* Screenshot hover */
  .ss-wrap { transition: transform .3s ease, box-shadow .3s ease; }
  .ss-wrap:hover { transform: translateY(-3px); box-shadow: 0 20px 48px rgba(0,0,0,.1) !important; }

  /* Codebase section */
  .term-line { animation: flickerIn .25s ease; }

  /* ── Responsive ──────────────────────────── */

  /* Tablet (640–1023px) */
  @media (max-width: 1023px) {
    .proj-detail-grid { grid-template-columns: 1fr !important; }
    .proj-detail-tree-row { flex-direction: column !important; }
    .codebase-grid { grid-template-columns: 1fr !important; }
    .proj-header-row { flex-direction: column !important; align-items: flex-start !important; }
    .proj-stats-row { flex-direction: row !important; gap: 20px !important; }
    .feat-grid { grid-template-columns: 1fr 1fr !important; }
    .hero-nav-pills { gap: 6px !important; }
  }

  /* Phone (< 640px) */
  @media (max-width: 639px) {
    .proj-detail-grid { grid-template-columns: 1fr !important; }
    .proj-detail-tree-row { flex-direction: column !important; }
    .codebase-grid { grid-template-columns: 1fr !important; }
    .proj-header-row { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
    .proj-stats-row { flex-wrap: wrap !important; gap: 16px !important; }
    .feat-grid { grid-template-columns: 1fr !important; }
    .hero-nav-pills { flex-direction: column !important; align-items: stretch !important; }
    .hero-nav-pills button { justify-content: center; }
    .ss-secondary-grid { grid-template-columns: 1fr !important; }
    .proj-bg-num { display: none !important; }
  }
`;

/* ─── Scroll Progress ─────────────────────────── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => { const el=document.documentElement; setPct((el.scrollTop/(el.scrollHeight-el.clientHeight))*100); };
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,height:2,zIndex:999,background:"rgba(0,0,0,.05)"}}>
      <div style={{height:"100%",width:`${pct}%`,backgroundImage:"linear-gradient(90deg,#4f46e5,#7c3aed,#0891b2)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",transition:"width .08s linear"}}/>
    </div>
  );
}

/* ─── Retro Grid ──────────────────────────────── */
function RetroGrid() {
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",zIndex:0,perspective:"500px"}}>
      <div style={{position:"absolute",inset:"-200% -50%",backgroundImage:`linear-gradient(rgba(99,102,241,.32) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.32) 1px,transparent 1px)`,backgroundSize:"60px 60px",transform:"rotateX(35deg) translateY(25%)",animation:"retrogrid 8s linear infinite",opacity:.65}}/>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,${T.bg} 0%,rgba(248,247,244,.6) 25%,transparent 55%,${T.bg} 100%)`}}/>
    </div>
  );
}

/* ─── Blur Fade ───────────────────────────────── */
function BlurFade({ children, delay=0 }: { children:React.ReactNode; delay?:number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVis(true); },{threshold:.08});
    if(ref.current) io.observe(ref.current);
    return()=>io.disconnect();
  },[]);
  return (
    <div ref={ref} style={{opacity:vis?1:0,filter:vis?"blur(0)":"blur(5px)",transform:vis?"translateY(0)":"translateY(12px)",transition:`opacity .55s ${delay}s ease,filter .55s ${delay}s ease,transform .55s ${delay}s ease`}}>
      {children}
    </div>
  );
}

/* ─── Shimmer Badge ───────────────────────────── */
function ShinyBadge({ children }: { children:React.ReactNode }) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"6px 16px",borderRadius:999,border:"1px solid rgba(79,70,229,.22)",backgroundImage:"linear-gradient(90deg,rgba(79,70,229,.07),rgba(124,58,237,.07))",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",fontSize:12,fontWeight:600,color:T.ind,letterSpacing:"0.07em",textTransform:"uppercase",position:"relative",overflow:"hidden",marginBottom:20}}>
      <span style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,.5) 50%,transparent 65%)",backgroundSize:"200% 100%",backgroundRepeat:"no-repeat",animation:"shimmer 2.8s ease-in-out infinite"}}/>
      <span style={{position:"relative"}}>{children}</span>
    </div>
  );
}


/* ─── Marquee ─────────────────────────────────── */
function Marquee({ items, rev=false }: { items:{n:string;img:string}[]; rev?:boolean }) {
  const all=[...items,...items];
  return (
    <div style={{overflow:"hidden",width:"100%"}}>
      <div style={{display:"flex",gap:8,width:"max-content",animation:`${rev?"mqright":"mqleft"} 28s linear infinite`}}>
        {all.map((item,i)=>(
          <div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:999,border:`1px solid ${T.bdr2}`,background:T.card,fontSize:12,color:T.tx2,whiteSpace:"nowrap"}}>
            <img src={item.img} alt={item.n} width={14} height={14} style={{objectFit:"contain",flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
            {item.n}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   DATA
════════════════════════════════════════════ */
const PROJECTS: {
  id:string; idx:string; icon:string; title:string; imgs:string[]; sub:string;
  color:string; colorRaw:string; desc:string; url?:string; imgFit?:"cover"|"contain";
  internal?:boolean;
  stats:{v:number;sfx:string;l:string}[];
  features:string[];
  techs:{n:string;img:string}[];
  tree:FileNode[];
}[] = [
  {
    id:"awam", idx:"01", icon:"🇲🇾", title:"PADU Public Portal",
    imgs:["/herosectionpadu.png"],
    sub:"Public Portal · padu-portal-awam-v2",
    url:"https://www.padu.gov.my",
    color:T.ind, colorRaw:"79,70,229",
    desc:"Official information website for Malaysia's Pangkalan Data Utama (PADU). I developed the front end of this official government portal — serving as the primary source for Malaysians to learn about the PADU system, featuring 20+ animated pages including infographics, a 3D carousel, and an AI chatbot.",
    stats:[{v:100,sfx:"k+",l:"Daily Users"},{v:20,sfx:"+",l:"Pages"},{v:4,sfx:"",l:"Core Services"}],
    features:["20+ animated page modules","3D carousel timeline (SejarahPaduPage)","PADUServices animated infographics","Strategic Collaboration agency grid 14+","Media & press release pages","Responsive across all breakpoints","Framer Motion entrance animations","HeroUI component library"],
    techs:[
      {n:"Next.js",img:"https://cdn.simpleicons.org/nextdotjs/111111"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
      {n:"Tailwind",img:"https://cdn.simpleicons.org/tailwindcss"},
      {n:"HeroUI",img:"https://cdn.simpleicons.org/heroui/111111"},
      {n:"Framer",img:"https://cdn.simpleicons.org/framer/111111"},
      {n:"Lottie",img:"https://cdn.simpleicons.org/lottiefiles"},
    ],
    tree:[
      {name:"app",type:"folder",children:[
        {name:"(pages)",type:"folder",children:[
          {name:"beranda",type:"folder",children:[{name:"page.tsx",type:"file"}]},
          {name:"perkhidmatan",type:"folder",children:[{name:"page.tsx",type:"file"}]},
          {name:"sejarah",type:"folder",children:[{name:"page.tsx",type:"file"}]},
          {name:"media",type:"folder",children:[{name:"page.tsx",type:"file"}]},
          {name:"kolaborasi",type:"folder",children:[{name:"page.tsx",type:"file"}]},
        ]},
        {name:"layout.tsx",type:"file"},{name:"page.tsx",type:"file"},
      ]},
      {name:"components",type:"folder",children:[
        {name:"PADUServices.tsx",type:"file"},
        {name:"SejarahPage.tsx",type:"file"},
        {name:"Navbar.tsx",type:"file"},
        {name:"Footer.tsx",type:"file"},
      ]},
    ] as FileNode[],
  },
  {
    id:"panduan", idx:"02", icon:"📖", title:"User Guide Portal",
    imgs:["/homepanduan.png"],
    sub:"User Guide Portal · Strapi CMS",
    internal:true,
    color:T.vio, colorRaw:"124,58,237",
    desc:"Official user guide portal with a headless CMS powered by Strapi. Enables dynamic content management by admins without writing code, paired with secure Google OAuth 2.0 authentication for government staff access control.",
    stats:[{v:3,sfx:"",l:"CMS Modules"},{v:100,sfx:"%",l:"Dynamic Content"},{v:1,sfx:"",l:"OAuth Provider"}],
    features:["Strapi headless CMS integration","RESTful API dynamic content fetching","Google OAuth 2.0 authentication","Government staff role-based access","Dynamic page rendering per slug","Content editor friendly interface","SEO optimized URL structure","Secure session management"],
    techs:[
      {n:"Next.js",img:"https://cdn.simpleicons.org/nextdotjs/111111"},
      {n:"Strapi",img:"https://cdn.simpleicons.org/strapi"},
      {n:"Google OAuth",img:"https://cdn.simpleicons.org/google"},
      {n:"REST API",img:"https://cdn.simpleicons.org/fastapi"},
      {n:"MySQL",img:"https://cdn.simpleicons.org/mysql"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
    ],
    tree:[
      {name:"app",type:"folder",children:[
        {name:"panduan",type:"folder",children:[
          {name:"[slug]",type:"folder",children:[{name:"page.tsx",type:"file"}]},
          {name:"page.tsx",type:"file"},
        ]},
        {name:"api",type:"folder",children:[
          {name:"auth",type:"folder",children:[{name:"[...nextauth]",type:"folder",children:[{name:"route.ts",type:"file"}]}]},
          {name:"content",type:"folder",children:[{name:"route.ts",type:"file"}]},
        ]},
      ]},
      {name:"lib",type:"folder",children:[
        {name:"strapi.ts",type:"file"},
        {name:"auth.ts",type:"file"},
      ]},
    ] as FileNode[],
  },
  {
    id:"analitik", idx:"03", icon:"📊", title:"Analytics Portal",
    imgs:["/homeanalitik.jpeg"],
    sub:"Analytics Portal · Ministry of Economy",
    internal:true,
    color:T.grn, colorRaw:"22,163,74",
    desc:"Government data analytics portal for KPI monitoring and policy planning. Built with interactive chart dashboards, advanced data filtering, and real-time KPI monitoring panels for policy analysts with REST API integration.",
    stats:[{v:10,sfx:"+",l:"Chart Modules"},{v:100,sfx:"%",l:"Real-time"},{v:3,sfx:"",l:"KPI Panels"}],
    features:["Interactive chart dashboards","KPI monitoring panels","Advanced data filtering system","REST API integration","Policy analyst-focused UI","Real-time data rendering"],
    techs:[
      {n:"Next.js",img:"https://cdn.simpleicons.org/nextdotjs/111111"},
      {n:"React",img:"https://cdn.simpleicons.org/react"},
      {n:"Tailwind CSS",img:"https://cdn.simpleicons.org/tailwindcss"},
      {n:"REST API",img:"https://cdn.simpleicons.org/fastapi"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
    ],
    tree:[
      {name:"app",type:"folder",children:[
        {name:"analitik",type:"folder",children:[
          {name:"dashboard",type:"folder",children:[{name:"page.tsx",type:"file"}]},
          {name:"kpi",type:"folder",children:[{name:"page.tsx",type:"file"}]},
          {name:"page.tsx",type:"file"},
        ]},
        {name:"api",type:"folder",children:[
          {name:"data",type:"folder",children:[{name:"route.ts",type:"file"}]},
          {name:"kpi",type:"folder",children:[{name:"route.ts",type:"file"}]},
        ]},
      ]},
      {name:"components",type:"folder",children:[
        {name:"charts",type:"folder",children:[
          {name:"BarChart.tsx",type:"file"},
          {name:"LineChart.tsx",type:"file"},
          {name:"KPIPanel.tsx",type:"file"},
        ]},
        {name:"filters",type:"folder",children:[
          {name:"DataFilter.tsx",type:"file"},
        ]},
      ]},
    ] as FileNode[],
  },
  {
    id:"chatbot", idx:"04", icon:"🤖", title:"AI Chatbot (MyINFO & PADU)",
    imgs:["/chatbotmyinfo.jpeg"],
    imgFit:"contain",
    sub:"Vertex AI · Conversational Agent",
    internal:true,
    color:T.cyn, colorRaw:"8,145,178",
    desc:"AI-powered chatbot built using Google Vertex AI Conversational Agents for MyINFO and the PADU Portal. Enhances user interaction and information accessibility with sophisticated NLU and custom Lottie animations.",
    stats:[{v:2,sfx:"",l:"Portals"},{v:24,sfx:"/7",l:"Uptime"},{v:100,sfx:"%",l:"AI Powered"}],
    features:["Google Vertex AI Conversational Agents","Natural language understanding (NLU)","Integrated into MyINFO portal","Integrated into Portal PADU","Custom Lottie animation robot icon","Shadow DOM CSS injection","Auto-refresh on session close","Dialogflow-compatible intent routing"],
    techs:[
      {n:"Vertex AI",img:"https://cdn.simpleicons.org/googlecloud"},
      {n:"Dialogflow",img:"https://cdn.simpleicons.org/dialogflow"},
      {n:"LottieFiles",img:"https://cdn.simpleicons.org/lottiefiles"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
      {n:"Next.js",img:"https://cdn.simpleicons.org/nextdotjs/111111"},
    ],
    tree:[
      {name:"components",type:"folder",children:[
        {name:"chatbot",type:"folder",children:[
          {name:"AIRAWidget.tsx",type:"file"},
          {name:"LottieIcon.tsx",type:"file"},
          {name:"ChatBubble.tsx",type:"file"},
        ]},
      ]},
      {name:"lib",type:"folder",children:[
        {name:"dialogflow.ts",type:"file"},
        {name:"vertex-ai.ts",type:"file"},
      ]},
      {name:"types",type:"folder",children:[
        {name:"custom-elements.d.ts",type:"file"},
      ]},
    ] as FileNode[],
  },
];


const STACK_TOP = [
  {n:"Next.js 15",img:"https://cdn.simpleicons.org/nextdotjs/111111"},
  {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
  {n:"Tailwind CSS",img:"https://cdn.simpleicons.org/tailwindcss"},
  {n:"Strapi",img:"https://cdn.simpleicons.org/strapi"},
  {n:"Vertex AI",img:"https://cdn.simpleicons.org/googlecloud"},
  {n:"HeroUI",img:"https://cdn.simpleicons.org/heroui/111111"},
  {n:"Framer Motion",img:"https://cdn.simpleicons.org/framer/111111"},
  {n:"LottieFiles",img:"https://cdn.simpleicons.org/lottiefiles"},
];
const STACK_BOT = [
  {n:"Google OAuth",img:"https://cdn.simpleicons.org/google"},
  {n:"MySQL",img:"https://cdn.simpleicons.org/mysql"},
  {n:"Figma",img:"https://cdn.simpleicons.org/figma"},
  {n:"Git (OSDEC)",img:"https://cdn.simpleicons.org/git"},
  {n:"REST API",img:"https://cdn.simpleicons.org/fastapi"},
  {n:"Dialogflow",img:"https://cdn.simpleicons.org/dialogflow"},
  {n:"React",img:"https://cdn.simpleicons.org/react"},
  {n:"Node.js",img:"https://cdn.simpleicons.org/nodedotjs"},
];

/* ════════════════════════════════════════════
   SCREENSHOT MOCKUP
════════════════════════════════════════════ */
function ScreenshotMockup({
  src, title, icon, color, compact = false, imgFit = "cover",
}: {
  src: string; title: string; icon: string; color: string; compact?: boolean; imgFit?: "cover"|"contain";
}) {
  return (
    <div className="ss-wrap" style={{
      borderRadius: 12, overflow: "hidden",
      border: `1px solid ${T.bdr2}`,
      boxShadow: "0 4px 20px rgba(0,0,0,.07)",
    }}>
      {/* Browser chrome */}
      <div style={{
        background: "#eeece6", padding: "8px 12px",
        display: "flex", alignItems: "center", gap: 8,
        borderBottom: `1px solid ${T.bdr}`,
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["#ef4444","#f59e0b","#22c55e"].map((c,i) =>
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
          )}
        </div>
        <div style={{
          flex: 1, background: "rgba(0,0,0,.05)", borderRadius: 5,
          padding: "2px 10px", fontSize: 10, color: T.tx3,
          textAlign: "center", overflow: "hidden",
          whiteSpace: "nowrap", textOverflow: "ellipsis",
        }}>
          padu.gov.my
        </div>
        <div style={{
          fontSize: 9, padding: "1px 6px",
          borderRadius: 4, background: `rgba(${color === T.ind ? "79,70,229" : color === T.vio ? "124,58,237" : "8,145,178"},.1)`,
          border: `1px solid rgba(${color === T.ind ? "79,70,229" : color === T.vio ? "124,58,237" : "8,145,178"},.2)`,
          fontWeight: 600, color: color,
        }}>LIVE</div>
      </div>
      {/* Image */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: compact ? "16/9" : "4/3",
        background: `rgba(${color === T.ind ? "79,70,229" : color === T.vio ? "124,58,237" : "8,145,178"},.04)`,
        overflow: "hidden",
      }}>
        <img
          src={src}
          alt={`${title} screenshot`}
          style={{ width: "100%", height: "100%", objectFit: imgFit ?? "cover", objectPosition: "top", display: "block" }}
          onError={e => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const p = el.parentElement!;
            p.style.display = "flex"; p.style.alignItems = "center";
            p.style.justifyContent = "center"; p.style.flexDirection = "column"; p.style.gap = "8px";
            p.innerHTML = `<div style="font-size:32px">${icon}</div><div style="font-size:10px;color:#aaa;font-family:system-ui;text-align:center;padding:0 8px">Screenshot<br/><code style="background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px;font-size:9px">/public${src}</code></div>`;
          }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PROJECT DETAIL — editorial layout (responsive)
════════════════════════════════════════════ */
function ProjectDetail({ proj, even }: { proj: typeof PROJECTS[0]; even: boolean }) {
  const cr   = proj.colorRaw;
  const bp   = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isSmall  = isMobile || isTablet;

  return (
    <div id={proj.id} style={{
      background: even ? T.bg : T.bg2,
      padding: isMobile ? "56px 16px 64px" : isTablet ? "72px 24px 80px" : "88px 24px 96px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Large muted index number — hidden on phone */}
      <div className="proj-bg-num" style={{
        position: "absolute",
        right: even ? "auto" : 0,
        left: even ? 0 : "auto",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "clamp(180px,22vw,280px)",
        fontWeight: 900,
        letterSpacing: "-0.06em",
        lineHeight: 1,
        color: `rgba(${cr},.045)`,
        pointerEvents: "none",
        userSelect: "none",
        fontFamily: "'Georgia','Times New Roman',serif",
        zIndex: 0,
      }}>
        {proj.idx}
      </div>

      <div style={{ maxWidth: 960, marginLeft: "auto", marginRight: "auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <BlurFade delay={0}>
          <div className="proj-header-row" style={{
            display: "flex",
            alignItems: isSmall ? "flex-start" : "flex-start",
            justifyContent: "space-between",
            flexDirection: isSmall ? "column" : "row",
            gap: isSmall ? 16 : 20,
            marginBottom: isMobile ? 28 : 48,
            paddingBottom: isMobile ? 20 : 32,
            borderBottom: `1px solid ${T.bdr2}`,
          }}>
            {/* Left: icon + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: proj.color,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  marginBottom: 6, fontFamily: "monospace",
                }}>
                  Project {proj.idx}
                </div>
                <div style={{
                  width: isMobile ? 40 : 48, height: isMobile ? 40 : 48,
                  borderRadius: 14,
                  background: `rgba(${cr},.1)`,
                  border: `1.5px solid rgba(${cr},.2)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isMobile ? 18 : 22,
                }}>
                  {proj.icon}
                </div>
              </div>
              <div>
                <h2 style={{
                  fontSize: isMobile ? "clamp(18px,5vw,22px)" : "clamp(22px,3.2vw,32px)",
                  fontWeight: 800, color: T.tx,
                  letterSpacing: "-0.025em", lineHeight: 1.1,
                  marginBottom: 6,
                }}>
                  {proj.title}
                </h2>
                <div style={{
                  fontSize: isMobile ? 11 : 12, color: T.tx3,
                  fontFamily: "monospace",
                  display: "flex", alignItems: "center", gap: 8,
                  flexWrap: "wrap",
                }}>
                  <span>{proj.sub}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 999,
                    background: `rgba(${cr},.1)`,
                    border: `1px solid rgba(${cr},.22)`,
                    color: proj.color, fontWeight: 600,
                    fontFamily: "sans-serif",
                  }}>
                    Active
                  </span>
                  {proj.internal && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 10, padding: "2px 8px", borderRadius: 999,
                      background: "rgba(107,114,128,.09)",
                      border: "1px solid rgba(107,114,128,.22)",
                      color: "#6b7280", fontWeight: 600,
                      fontFamily: "sans-serif",
                    }}>
                      🔒 Internal Use
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tech Pills — replacing stats position */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0, justifyContent: "flex-end", maxWidth: isSmall ? "100%" : 320 }}>
              {proj.techs.map((t, ti) => (
                <div key={ti} className="tech-pill-min" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 11px", borderRadius: 999,
                  border: `1px solid ${T.bdr2}`,
                  background: T.bg2, fontSize: 11.5, color: T.tx2, fontWeight: 500,
                  cursor: "default",
                }}>
                  <img src={t.img} alt={t.n} width={13} height={13}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  {t.n}
                </div>
              ))}
            </div>

          </div>
        </BlurFade>

        {/* ── Main grid: Description + Screenshot ── */}
        {/* Mobile/tablet → single column, desktop → two column */}
        <div className="proj-detail-grid" style={{
          display: "grid",
          gridTemplateColumns: isSmall || proj.imgs.length === 0 ? "1fr" : "1fr 1.7fr",
          gap: isMobile ? 28 : isTablet ? 32 : 40,
          marginBottom: isMobile ? 28 : 40,
          alignItems: "start",
        }}>
          {/* Left: Description + Features + Stack */}
          <BlurFade delay={0.08}>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 28 }}>
              {/* Prose */}
              <div>
                <p style={{
                  fontSize: isMobile ? 13 : 14, color: T.tx2, lineHeight: 1.9,
                  borderLeft: `3px solid rgba(${cr},.35)`,
                  paddingLeft: 14,
                  marginBottom: proj.url ? 12 : 0,
                }}>
                  {proj.desc}
                </p>
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "9px 16px", borderRadius: 999,
                    background: `rgba(${cr},.08)`,
                    border: `1px solid rgba(${cr},.25)`,
                    color: proj.color, fontWeight: 600, fontSize: 13,
                    textDecoration: "none", transition: "background .18s",
                  }}>
                    <ArrowUpRight size={14} />
                    {proj.url.replace("https://www.", "")}
                  </a>
                )}
              </div>

              {/* Features grid */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: T.tx3,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  marginBottom: 12, fontFamily: "monospace",
                }}>
                  Key Features
                </div>
                <div className="feat-grid" style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "7px 10px",
                }}>
                  {proj.features.map((f, fi) => (
                    <div key={fi} className="feat-pill" style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "8px 10px", borderRadius: 8,
                      background: T.card, border: `1px solid ${T.bdr}`,
                      fontSize: isMobile ? 11.5 : 12, color: T.tx2, lineHeight: 1.45,
                    }}>
                      <div style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: proj.color, flexShrink: 0, marginTop: 4,
                      }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </BlurFade>

          {/* Right: Screenshots */}
          {proj.imgs.length > 0 && (
            <BlurFade delay={isSmall ? 0.06 : 0.14}>
              {proj.imgs.length > 1 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", justifyContent: "center", height: "100%" }}>
                  {[
                    { src: proj.imgs[0], label: "PADU Public Portal", imgFit: "cover" as const },
                    { src: proj.imgs[1], label: "MyINFO Portal", imgFit: "contain" as const },
                  ].map(({ src, label, imgFit }, si) => (
                    <div key={si} style={{ width: "100%" }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: proj.color,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        fontFamily: "monospace", marginBottom: 6, textAlign: "center",
                      }}>{label}</div>
                      <ScreenshotMockup src={src} title={label} icon={proj.icon} color={proj.color} compact imgFit={imgFit} />
                    </div>
                  ))}
                </div>
              ) : (
                <ScreenshotMockup
                  src={proj.imgs[0]} title={proj.title}
                  icon={proj.icon} color={proj.color}
                  imgFit={proj.imgFit ?? "cover"}
                />
              )}
            </BlurFade>
          )}
        </div>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PROJECT INDEX SECTION
════════════════════════════════════════════ */
function ProjectIndex({ onNav }: { onNav: (id: string) => void }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [hovIdx, setHovIdx] = useState<number | null>(null);

  return (
    <section style={{ background: T.bg, padding: "88px 24px" }}>
      <div style={{ maxWidth: 960, marginLeft: "auto", marginRight: "auto" }}>

        {/* Header */}
        <BlurFade>
          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", gap: 20,
            marginBottom: 40,
          }}>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: T.ind,
                letterSpacing: "0.14em", textTransform: "uppercase",
                fontFamily: "monospace", marginBottom: 10,
              }}>
                4 Projects · 2025
              </div>
              <h2 style={{
                fontSize: "clamp(26px,4vw,40px)",
                fontWeight: 800, color: T.tx,
                letterSpacing: "-0.03em", lineHeight: 1,
              }}>
                All <span className="gtext">Projects</span>
              </h2>
            </div>
            <p style={{ fontSize: 13, color: T.tx3, maxWidth: 240, textAlign: "right", lineHeight: 1.7 }}>
              Click any project to view full details, screenshots, and codebase.
            </p>
          </div>
        </BlurFade>

        {/* Index rows — editorial table */}
        <div style={{ borderTop: `1px solid ${T.bdr2}` }}>
          {PROJECTS.map((p, i) => (
            <BlurFade key={p.id} delay={i * 0.07}>
              <div
                className="proj-index-row"
                onClick={() => onNav(p.id)}
                onMouseEnter={() => setHovIdx(i)}
                onMouseLeave={() => setHovIdx(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 36px" : "56px 1fr auto auto 40px",
                  alignItems: "center", gap: isMobile ? 12 : 24,
                  padding: "28px 20px",
                  borderBottom: `1px solid ${T.bdr}`,
                  borderLeft: hovIdx === i ? `3px solid ${p.color}` : "3px solid transparent",
                  borderRadius: 2,
                  background: hovIdx === i ? T.card : "transparent",
                  cursor: "pointer",
                  transition: "all .18s ease",
                }}
              >
                {/* Index number */}
                {!isMobile && (
                  <div style={{
                    fontSize: 32, fontWeight: 900,
                    color: hovIdx === i ? p.color : `rgba(${p.colorRaw},.18)`,
                    fontFamily: "'Georgia','Times New Roman',serif",
                    lineHeight: 1, transition: "color .18s",
                  }}>
                    {p.idx}
                  </div>
                )}

                {/* Project info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <span style={{
                      fontWeight: 700, fontSize: 16, color: T.tx,
                      letterSpacing: "-0.01em",
                    }}>
                      {p.title}
                    </span>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 999,
                      background: `rgba(${p.colorRaw},.08)`,
                      border: `1px solid rgba(${p.colorRaw},.2)`,
                      color: p.color, fontWeight: 600,
                    }}>
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: T.tx3, fontFamily: "monospace" }}>
                    {p.sub}
                  </div>
                </div>


                {/* Tech pills — compact */}
                {!isMobile && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 200 }}>
                    {p.techs.slice(0, 3).map((t, ti) => (
                      <span key={ti} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 999,
                        border: `1px solid ${T.bdr2}`,
                        background: T.bg2, color: T.tx3,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <img src={t.img} alt={t.n} width={10} height={10}
                          style={{ objectFit: "contain", flexShrink: 0 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        {t.n}
                      </span>
                    ))}
                  </div>
                )}

                {/* Arrow */}
                <div className="idx-arrow" style={{
                  opacity: hovIdx === i ? 1 : 0.2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ArrowUpRight size={18} color={p.color} />
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ════════════════════════════════════════════
   PAGE
════════════════════════════════════════════ */
export default function PaduPage() {
  const [activeProj, setActiveProj] = useState("awam");
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const navTo = (id: string) => {
    setActiveProj(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh" }}>
        <ScrollProgress />

        {/* ══ HERO (unchanged except responsive padding) ═══════════════ */}
        <section style={{
          position: "relative", minHeight: "82vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          padding: "80px 20px 60px",
          textAlign: "center", background: T.bg,
        }}>
          {/* Right arrow — navigate to FYP project */}
          {!isMobile && (
            <button
              onClick={() => window.location.href = "/projects/fyp-project"}
              style={{
                position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                background: T.card, border: `1px solid ${T.bdr2}`, borderRadius: 16,
                padding: "20px 14px", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.08)",
                color: T.tx3, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", transition: "all .2s ease",
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.color = T.ind; b.style.borderColor = T.ind; b.style.boxShadow = "0 8px 28px rgba(79,70,229,.15)"; }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.color = T.tx3; b.style.borderColor = T.bdr2; b.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)"; }}
            >
              <ArrowRight size={24} />
              <span style={{ writingMode: "vertical-rl" }}>FYP</span>
            </button>
          )}
          <RetroGrid />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%,rgba(79,70,229,.07) 0%,transparent 65%)", zIndex: 1, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 10, maxWidth: 760, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <BlurFade delay={0}>
              <button onClick={() => window.history.back()} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: T.tx3, background: "none", border: `1px solid ${T.bdr2}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer", marginBottom: 4 }}>
                <ArrowLeft size={13} />Back to Portfolio
              </button>
            </BlurFade>
            <BlurFade delay={0.05}>
              <ShinyBadge>Ministry of Economy Malaysia</ShinyBadge>
            </BlurFade>
            <BlurFade delay={0.1}>
              <h1 style={{ fontSize: "clamp(32px,6.5vw,72px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, color: T.tx }}>
                PADU <span className="aurora-text">Projects</span>
              </h1>
            </BlurFade>
            <BlurFade delay={0.15}>
              <p style={{ maxWidth: 520, fontSize: "clamp(13px,3.5vw,14.5px)", color: T.tx3, lineHeight: 1.88 }}>
                Four gov-tech digital products I built at{" "}
                <span style={{ color: T.ind, fontWeight: 600 }}>PADU Unit, Ministry of Economy Malaysia</span>{" "}
                — Public Portal, User Guide Portal, Analytics Portal, and AI Chatbot.
              </p>
            </BlurFade>
            <BlurFade delay={0.25}>
              <div className="hero-nav-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
                {PROJECTS.map(p => (
                  <button key={p.id} onClick={() => navTo(p.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      padding: "8px 18px", borderRadius: 999, fontSize: 13,
                      fontWeight: 500, cursor: "pointer",
                      border: `1.5px solid ${activeProj === p.id ? p.color : T.bdr2}`,
                      backgroundColor: activeProj === p.id ? `rgba(${p.colorRaw},.1)` : "transparent",
                      backgroundImage: "none",
                      color: activeProj === p.id ? p.color : T.tx2,
                      transition: "all .18s",
                      minHeight: 44,
                    }}>
                    <span>{p.icon}</span>{p.title}
                  </button>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* ══ MARQUEE (unchanged) ══════════════════════════════════════ */}
        <div style={{ background: T.card, borderTop: `1px solid ${T.bdr}`, borderBottom: `1px solid ${T.bdr}`, padding: "20px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Marquee items={STACK_TOP} />
            <Marquee items={STACK_BOT} rev />
          </div>
        </div>

        {/* ══ PROJECT DETAILS ══════════════════════════════════════════ */}
        {PROJECTS.map((proj, idx) => (
          <ProjectDetail key={proj.id} proj={proj} even={idx % 2 === 0} />
        ))}

      </div>
        {/* ── Mobile Project Nav ── */}
        {isMobile && (
          <div style={{
            background: T.card, borderTop: `1px solid ${T.bdr2}`,
            padding: "14px 20px",
            display: "flex", alignItems: "center", justifyContent: "flex-end",
          }}>
            <button
              onClick={() => window.location.href = "/projects/fyp-project"}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 999,
                border: `1.5px solid ${T.bdr2}`, background: T.card,
                color: T.tx3, fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              FYP <ArrowRight size={15} />
            </button>
          </div>
        )}
    </>
  );
}