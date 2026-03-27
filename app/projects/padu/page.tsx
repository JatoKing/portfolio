"use client";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ExternalLink, Globe, Database, Code2, Layers,
  CheckCircle2, FolderOpen, Folder, FileCode, ChevronRight,
  ArrowRight, Clock, Star, Lock, MessageSquare, Users, Zap,
  BookOpen, Bot, ArrowUpRight,
} from "lucide-react";

interface FileNode { name: string; type: "file"|"folder"; children?: FileNode[]; }
interface TermLine { text: string; kind: "cmd"|"out"|"ok"|"info"; }

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

/* ─── Number Ticker ───────────────────────────── */
function Ticker({ to, sfx="" }: { to:number; sfx?:string }) {
  const [n,setN]=useState(0); const ref=useRef<HTMLSpanElement>(null); const done=useRef(false);
  useEffect(()=>{
    const io=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!done.current){ done.current=true; let t0:number|undefined;
        const step=(ts:number)=>{if(!t0)t0=ts;const p=Math.min((ts-t0)/1400,1);setN(Math.round((1-(1-p)**3)*to));if(p<1)requestAnimationFrame(step);};
        requestAnimationFrame(step);}},{threshold:.5});
    if(ref.current)io.observe(ref.current); return()=>io.disconnect();
  },[to]);
  return <span ref={ref}>{n}{sfx}</span>;
}

/* ─── File Tree ───────────────────────────────── */
function TreeNode({ node, depth=0 }: { node:FileNode; depth?:number }) {
  const [open,setOpen]=useState(depth<2);
  const ext=node.name.split(".").pop();
  const fclr=ext==="tsx"||ext==="jsx"?"#0891b2":ext==="ts"||ext==="js"?"#3178c6":ext==="css"?"#e85d04":ext==="json"?"#d97706":T.tx2;
  return (
    <div>
      <div onClick={()=>node.type==="folder"&&setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 0",paddingLeft:depth*14,cursor:node.type==="folder"?"pointer":"default",fontSize:12,color:node.type==="folder"?T.tx:fclr}}>
        {node.type==="folder"?(<><ChevronRight size={11} color={T.tx3} style={{transform:open?"rotate(90deg)":"none",transition:"transform .15s",flexShrink:0}}/>{open?<FolderOpen size={13} color="#f59e0b" style={{flexShrink:0}}/>:<Folder size={13} color="#f59e0b" style={{flexShrink:0}}/>}</>):(<><span style={{width:11,flexShrink:0}}/><FileCode size={12} color={fclr} style={{flexShrink:0}}/></>)}
        <span style={{fontFamily:"monospace"}}>{node.name}</span>
      </div>
      {node.type==="folder"&&open&&node.children?.map((c,i)=><TreeNode key={i} node={c} depth={depth+1}/>)}
    </div>
  );
}

/* ─── Terminal ────────────────────────────────── */
function Terminal({ lines }: { lines:TermLine[] }) {
  const [vis,setVis]=useState(0); const ref=useRef<HTMLDivElement>(null); const done=useRef(false);
  useEffect(()=>{
    const io=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!done.current){done.current=true;lines.forEach((_,i)=>setTimeout(()=>setVis(i+1),i*280));}},{threshold:.3});
    if(ref.current)io.observe(ref.current); return()=>io.disconnect();
  },[lines.length]);
  const clr=(k:string)=>k==="cmd"?"#818cf8":k==="ok"?"#4ade80":k==="info"?"#67e8f9":"rgba(255,255,255,.35)";
  const pfx=(k:string)=>k==="cmd"?"❯ ":k==="ok"?"✓ ":k==="info"?"▲ ":"  ";
  return (
    <div ref={ref} style={{fontFamily:"monospace",fontSize:12.5,lineHeight:1.85,padding:"20px 22px",background:"#0c0c10",borderRadius:14,border:`1px solid rgba(255,255,255,.06)`,minHeight:200}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        {["#ef4444","#f59e0b","#22c55e"].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
        <span style={{fontSize:11,color:"rgba(255,255,255,.2)",marginLeft:8}}>zsh — padu-portal</span>
      </div>
      {lines.slice(0,vis).map((l,i)=>(
        <div key={i} className="term-line" style={{color:clr(l.kind)}}>
          <span style={{opacity:.5}}>{pfx(l.kind)}</span>{l.text}
        </div>
      ))}
      {vis<lines.length&&<span style={{color:"#818cf8"}}>█</span>}
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
  color:string; colorRaw:string; desc:string;
  stats:{v:number;sfx:string;l:string}[];
  features:string[];
  techs:{n:string;img:string}[];
  tree:FileNode[];
}[] = [
  {
    id:"awam", idx:"01", icon:"🇲🇾", title:"Portal Awam PADU",
    imgs:["/images/portal-awam-1.png","/images/portal-awam-2.png","/images/portal-awam-3.png"],
    sub:"Public Portal · padu-portal-awam-v2",
    color:T.ind, colorRaw:"79,70,229",
    desc:"Portal awam rasmi Pangkalan Data Utama Malaysia. Antara muka utama untuk rakyat Malaysia mengakses maklumat sosio-ekonomi, semak status, dan berinteraksi dengan sistem PADU. Dibangunkan dengan 20+ halaman animasi termasuk infografik, karusel 3D, dan chatbot AI.",
    stats:[{v:100,sfx:"k+",l:"Daily Users"},{v:20,sfx:"+",l:"Pages"},{v:4,sfx:"",l:"Core Services"}],
    features:["20+ animated page modules","3D carousel timeline (SejarahPaduPage)","PADUServices animated infographics","KolaborasiStrategik agency grid 14+","Media & press release pages","Responsive across all breakpoints","Framer Motion entrance animations","HeroUI component library"],
    techs:[
      {n:"Next.js 15",img:"https://cdn.simpleicons.org/nextdotjs/111111"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
      {n:"Tailwind CSS",img:"https://cdn.simpleicons.org/tailwindcss"},
      {n:"HeroUI",img:"https://cdn.simpleicons.org/heroui/111111"},
      {n:"Framer Motion",img:"https://cdn.simpleicons.org/framer/111111"},
      {n:"LottieFiles",img:"https://cdn.simpleicons.org/lottiefiles"},
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
    id:"panduan", idx:"02", icon:"📖", title:"Portal Panduan Pengguna",
    imgs:["/images/portal-panduan-1.png","/images/portal-panduan-2.png"],
    sub:"User Guide Portal · Strapi CMS",
    color:T.vio, colorRaw:"124,58,237",
    desc:"Portal panduan pengguna rasmi dengan headless CMS menggunakan Strapi. Membolehkan pengurusan kandungan dinamik oleh admin tanpa perlu kod, dilengkapi autentikasi selamat Google OAuth 2.0 untuk kawalan akses kakitangan kerajaan.",
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
    id:"chatbot", idx:"03", icon:"🤖", title:"AI Chatbot (MyINFO & PADU)",
    imgs:["/images/chatbot-1.png","/images/chatbot-2.png"],
    sub:"Vertex AI · Conversational Agent",
    color:T.cyn, colorRaw:"8,145,178",
    desc:"AI-powered chatbot dibangunkan menggunakan Google Vertex AI Conversational Agents untuk MyINFO dan Portal PADU. Meningkatkan interaksi pengguna dan aksesibiliti maklumat secara automatik dengan NLU yang sofistikated dan animasi Lottie custom.",
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

const TERM_LINES: TermLine[] = [
  {text:"cd padu-portal-awam-v2",kind:"cmd"},
  {text:"npm install",kind:"cmd"},
  {text:"added 318 packages in 19s",kind:"out"},
  {text:"npm run dev",kind:"cmd"},
  {text:"Next.js 15.0.0 (Turbopack)",kind:"info"},
  {text:"Compiled /beranda in 1.1s",kind:"ok"},
  {text:"Ready on http://localhost:3000",kind:"ok"},
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
  src, title, icon, color, index, total,
}: {
  src: string; title: string; icon: string; color: string; index: number; total: number;
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
          padu.gov.my {total > 1 ? `· view ${index + 1}/${total}` : ""}
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
        position: "relative", width: "100%", aspectRatio: "16/9",
        background: `rgba(${color === T.ind ? "79,70,229" : color === T.vio ? "124,58,237" : "8,145,178"},.04)`,
        overflow: "hidden",
      }}>
        <img
          src={src}
          alt={`${title} screenshot ${index + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
          onError={e => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const p = el.parentElement!;
            p.style.display = "flex"; p.style.alignItems = "center";
            p.style.justifyContent = "center"; p.style.flexDirection = "column"; p.style.gap = "8px";
            p.innerHTML = `<div style="font-size:32px">${icon}</div><div style="font-size:10px;color:#aaa;font-family:system-ui;text-align:center;padding:0 8px">Screenshot ${index+1}<br/><code style="background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px;font-size:9px">/public${src}</code></div>`;
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
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="proj-stats-row" style={{
              display: "flex",
              gap: isMobile ? 20 : 32,
              flexShrink: 0,
              flexWrap: "wrap",
            }}>
              {proj.stats.map((s, i) => (
                <div key={i} style={{ textAlign: isSmall ? "left" : "right" }}>
                  <div style={{
                    fontSize: isMobile ? "clamp(20px,5vw,24px)" : "clamp(22px,3vw,30px)",
                    fontWeight: 800,
                    color: proj.color, letterSpacing: "-0.03em", lineHeight: 1,
                  }}>
                    <Ticker to={s.v} sfx={s.sfx} />
                  </div>
                  <div style={{
                    fontSize: 10, color: T.tx3, marginTop: 3,
                    fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BlurFade>

        {/* ── Main grid: Description + Screenshot ── */}
        {/* Mobile/tablet → single column, desktop → two column */}
        <div className="proj-detail-grid" style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "1fr" : "1fr 1.15fr",
          gap: isMobile ? 28 : isTablet ? 32 : 40,
          marginBottom: isMobile ? 28 : 40,
          alignItems: "start",
        }}>
          {/* Left: Description + Features + Stack */}
          <BlurFade delay={0.08}>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 28 }}>
              {/* Prose */}
              <p style={{
                fontSize: isMobile ? 13 : 14, color: T.tx2, lineHeight: 1.9,
                borderLeft: `3px solid rgba(${cr},.35)`,
                paddingLeft: 14,
              }}>
                {proj.desc}
              </p>

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

              {/* Tech Pills */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: T.tx3,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  marginBottom: 10, fontFamily: "monospace",
                }}>
                  Stack
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
            </div>
          </BlurFade>

          {/* Right: Screenshots */}
          <BlurFade delay={isSmall ? 0.06 : 0.14}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ScreenshotMockup
                src={proj.imgs[0]} title={proj.title}
                icon={proj.icon} color={proj.color}
                index={0} total={proj.imgs.length}
              />
              {proj.imgs.length > 1 && (
                <div className="ss-secondary-grid" style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${proj.imgs.length - 1}, 1fr)`,
                  gap: 10,
                }}>
                  {proj.imgs.slice(1).map((src, si) => (
                    <ScreenshotMockup
                      key={si} src={src} title={proj.title}
                      icon={proj.icon} color={proj.color}
                      index={si + 1} total={proj.imgs.length}
                    />
                  ))}
                </div>
              )}
            </div>
          </BlurFade>
        </div>

        {/* ── File tree ── */}
        <BlurFade delay={0.2}>
          <div className="proj-detail-tree-row" style={{
            borderTop: `1px solid ${T.bdr}`,
            paddingTop: 20,
            display: "flex",
            flexDirection: isSmall ? "column" : "row",
            alignItems: "flex-start",
            gap: isSmall ? 10 : 20,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: T.tx3,
              letterSpacing: "0.12em", textTransform: "uppercase",
              fontFamily: "monospace", flexShrink: 0,
              paddingTop: isSmall ? 0 : 3,
            }}>
              {isSmall ? "File Structure" : "File\nStructure"}
            </div>
            <div style={{
              flex: 1, width: "100%", background: T.card, borderRadius: 10,
              border: `1px solid ${T.bdr}`, padding: "14px 16px",
            }}>
              <TreeNode node={{
                name: proj.id === "awam" ? "padu-portal-awam-v2"
                  : proj.id === "panduan" ? "portal-panduan"
                  : "chatbot-widget",
                type: "folder", children: proj.tree,
              }} depth={0} />
            </div>
          </div>
        </BlurFade>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PROJECT INDEX SECTION
════════════════════════════════════════════ */
function ProjectIndex({ onNav }: { onNav: (id: string) => void }) {
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
                3 Projects · 2025
              </div>
              <h2 style={{
                fontSize: "clamp(26px,4vw,40px)",
                fontWeight: 800, color: T.tx,
                letterSpacing: "-0.03em", lineHeight: 1,
              }}>
                Semua <span className="gtext">Projek</span>
              </h2>
            </div>
            <p style={{ fontSize: 13, color: T.tx3, maxWidth: 240, textAlign: "right", lineHeight: 1.7 }}>
              Klik mana-mana projek untuk lihat detail penuh, screenshots, dan codebase.
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
                  gridTemplateColumns: "56px 1fr auto auto 40px",
                  alignItems: "center", gap: 24,
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
                <div style={{
                  fontSize: 32, fontWeight: 900,
                  color: hovIdx === i ? p.color : `rgba(${p.colorRaw},.18)`,
                  fontFamily: "'Georgia','Times New Roman',serif",
                  lineHeight: 1, transition: "color .18s",
                }}>
                  {p.idx}
                </div>

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

                {/* Stats mini */}
                <div style={{ display: "flex", gap: 28, flexShrink: 0 }}>
                  {p.stats.slice(0, 2).map((s, si) => (
                    <div key={si} style={{ textAlign: "center" }}>
                      <div style={{
                        fontSize: 18, fontWeight: 800,
                        color: hovIdx === i ? p.color : T.tx,
                        letterSpacing: "-0.02em", lineHeight: 1,
                        transition: "color .18s",
                      }}>
                        {s.v}{s.sfx}
                      </div>
                      <div style={{ fontSize: 10, color: T.tx3, marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Tech pills — compact */}
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
   CODEBASE SECTION — responsive
════════════════════════════════════════════ */
function CodebaseSection() {
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isSmall  = isMobile || isTablet;

  return (
    <section style={{ background: T.bg2, padding: isMobile ? "56px 16px 64px" : "88px 24px" }}>
      <div style={{ maxWidth: 960, marginLeft: "auto", marginRight: "auto" }}>
        <BlurFade>
          <div style={{
            display: "flex", alignItems: isSmall ? "flex-start" : "flex-end",
            flexDirection: isSmall ? "column" : "row",
            justifyContent: "space-between", gap: 16, marginBottom: 32,
          }}>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: T.ind,
                letterSpacing: "0.14em", textTransform: "uppercase",
                fontFamily: "monospace", marginBottom: 10,
              }}>
                Dev Setup
              </div>
              <h2 style={{
                fontSize: isMobile ? "clamp(20px,5.5vw,26px)" : "clamp(22px,3.2vw,32px)",
                fontWeight: 800, color: T.tx, letterSpacing: "-0.025em",
              }}>
                Codebase &amp; <span className="gtext">Environment</span>
              </h2>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 999,
              background: T.card, border: `1px solid ${T.bdr2}`,
              fontSize: 12, color: T.tx3, fontFamily: "monospace",
              flexShrink: 0,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
              Next.js 15 + Turbopack
            </div>
          </div>
        </BlurFade>

        <div className="codebase-grid" style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr",
          gap: 16,
        }}>
          <BlurFade delay={0}>
            <Terminal lines={TERM_LINES} />
          </BlurFade>
          <BlurFade delay={0.1}>
            <div style={{
              background: T.card, borderRadius: 14,
              border: `1px solid ${T.bdr2}`, padding: "20px 22px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.bdr}`,
              }}>
                <FolderOpen size={14} color="#f59e0b" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.tx, fontFamily: "monospace" }}>
                  padu-portal-awam-v2
                </span>
              </div>
              <TreeNode node={{ name: "padu-portal-awam-v2", type: "folder", children: [
                {name:"app",type:"folder",children:[
                  {name:"(pages)",type:"folder",children:[
                    {name:"beranda",type:"folder",children:[{name:"page.tsx",type:"file"}]},
                    {name:"perkhidmatan",type:"folder",children:[{name:"page.tsx",type:"file"}]},
                    {name:"panduan",type:"folder",children:[{name:"page.tsx",type:"file"}]},
                  ]},
                  {name:"api",type:"folder",children:[
                    {name:"auth",type:"folder",children:[{name:"route.ts",type:"file"}]},
                    {name:"content",type:"folder",children:[{name:"route.ts",type:"file"}]},
                  ]},
                  {name:"layout.tsx",type:"file"},{name:"page.tsx",type:"file"},
                ]},
                {name:"components",type:"folder",children:[
                  {name:"chatbot",type:"folder",children:[{name:"AIRAWidget.tsx",type:"file"}]},
                  {name:"sections",type:"folder",children:[{name:"PADUServices.tsx",type:"file"},{name:"SejarahPage.tsx",type:"file"}]},
                  {name:"ui",type:"folder",children:[{name:"Navbar.tsx",type:"file"},{name:"Footer.tsx",type:"file"}]},
                ]},
                {name:"lib",type:"folder",children:[{name:"strapi.ts",type:"file"},{name:"vertex-ai.ts",type:"file"},{name:"auth.ts",type:"file"}]},
                {name:"next.config.ts",type:"file"},{name:"tailwind.config.ts",type:"file"},
              ]}} depth={0} />
            </div>
          </BlurFade>
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
          <RetroGrid />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%,rgba(79,70,229,.07) 0%,transparent 65%)", zIndex: 1, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 10, maxWidth: 760, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <BlurFade delay={0}>
              <button onClick={() => window.history.back()} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: T.tx3, background: "none", border: `1px solid ${T.bdr2}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer", marginBottom: 4 }}>
                <ArrowLeft size={13} />Kembali ke Portfolio
              </button>
            </BlurFade>
            <BlurFade delay={0.05}>
              <ShinyBadge>Kementerian Ekonomi Malaysia</ShinyBadge>
            </BlurFade>
            <BlurFade delay={0.1}>
              <h1 style={{ fontSize: "clamp(32px,6.5vw,72px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, color: T.tx }}>
                Projek <span className="aurora-text">PADU</span>
              </h1>
            </BlurFade>
            <BlurFade delay={0.15}>
              <p style={{ maxWidth: 520, fontSize: "clamp(13px,3.5vw,14.5px)", color: T.tx3, lineHeight: 1.88 }}>
                Tiga produk digital gov-tech yang saya bangunkan di{" "}
                <span style={{ color: T.ind, fontWeight: 600 }}>Unit PADU, Kementerian Ekonomi Malaysia</span>{" "}
                — Portal Awam, Portal Panduan Pengguna, dan AI Chatbot.
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

        {/* ══ CODEBASE ════════════════════════════════════════════════ */}
        <CodebaseSection />

      </div>
    </>
  );
}