"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ExternalLink, Globe, Database, Code2, Layers, CheckCircle2, FolderOpen, Folder, FileCode, ChevronRight, ArrowRight, Clock, Star, Lock, MessageSquare, Users, Zap, BookOpen, Bot } from "lucide-react";

interface FileNode { name: string; type: "file"|"folder"; children?: FileNode[]; }
interface TermLine { text: string; kind: "cmd"|"out"|"ok"|"info"; }

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
  @keyframes scrollProg{}
  @keyframes mqleft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes mqright{from{transform:translateX(-50%)}to{transform:translateX(0)}}
  .gtext{background:linear-gradient(135deg,#4f46e5,#7c3aed,#0891b2,#4f46e5);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gshift 5s ease infinite;}
  .aurora-text{background:linear-gradient(270deg,#4f46e5,#7c3aed,#0891b2,#06b6d4,#4f46e5);background-size:400% 400%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:auroraMove 8s ease infinite;}
  .hl{transition:transform .22s ease,box-shadow .22s ease;}
  .hl:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.08);}
  .beam-line{stroke-dasharray:8 5;animation:flowDash 1.5s linear infinite;}
  .beam2{stroke-dasharray:8 5;animation:flowDash 2.2s linear infinite;}
  .beam3{stroke-dasharray:8 5;animation:flowDash 1s linear infinite;}
`;

// ── SCROLL PROGRESS ──────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => { const el=document.documentElement; setPct((el.scrollTop/(el.scrollHeight-el.clientHeight))*100); };
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,height:3,zIndex:999,background:"rgba(0,0,0,.05)"}}>
      <div style={{height:"100%",width:`${pct}%`,backgroundImage:"linear-gradient(90deg,#4f46e5,#7c3aed,#0891b2)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",transition:"width .08s linear"}}/>
    </div>
  );
}

// ── RETRO GRID ───────────────────────────────
function RetroGrid() {
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",zIndex:0,perspective:"500px"}}>
      <div style={{position:"absolute",inset:"-200% -50%",backgroundImage:`linear-gradient(rgba(99,102,241,.32) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.32) 1px,transparent 1px)`,backgroundSize:"60px 60px",transform:"rotateX(35deg) translateY(25%)",animation:"retrogrid 8s linear infinite",opacity:.65}}/>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,${T.bg} 0%,rgba(248,247,244,.6) 25%,transparent 55%,${T.bg} 100%)`}}/>
    </div>
  );
}

// ── BLUR FADE ────────────────────────────────
function BlurFade({ children, delay=0 }: { children:React.ReactNode; delay?:number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVis(true); },{threshold:.1});
    if(ref.current) io.observe(ref.current);
    return()=>io.disconnect();
  },[]);
  return (
    <div ref={ref} style={{opacity:vis?1:0,filter:vis?"blur(0)":"blur(6px)",transform:vis?"translateY(0)":"translateY(14px)",transition:`opacity .6s ${delay}s ease,filter .6s ${delay}s ease,transform .6s ${delay}s ease`}}>
      {children}
    </div>
  );
}

// ── SHIMMER BADGE ────────────────────────────
function ShinyBadge({ children }: { children:React.ReactNode }) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"6px 16px",borderRadius:999,border:"1px solid rgba(79,70,229,.22)",backgroundImage:"linear-gradient(90deg,rgba(79,70,229,.07),rgba(124,58,237,.07))",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",fontSize:12,fontWeight:600,color:T.ind,letterSpacing:"0.07em",textTransform:"uppercase",position:"relative",overflow:"hidden",marginBottom:20}}>
      <span style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,.5) 50%,transparent 65%)",backgroundSize:"200% 100%",backgroundRepeat:"no-repeat",animation:"shimmer 2.8s ease-in-out infinite"}}/>
      <span style={{position:"relative"}}>{children}</span>
    </div>
  );
}

// ── SECTION BADGE ────────────────────────────
function SBadge({ children }: { children:React.ReactNode }) {
  return <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 13px",borderRadius:999,border:"1px solid rgba(79,70,229,.2)",backgroundColor:"rgba(79,70,229,.07)",backgroundImage:"none",color:T.ind,fontSize:11,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>{children}</div>;
}

// ── NUMBER TICKER ────────────────────────────
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

// ── RIPPLE BUTTON ────────────────────────────
function RippleBtn({ children, onClick, variant="primary", style={} }: { children:React.ReactNode; onClick?:()=>void; variant?:"primary"|"outline"; style?:React.CSSProperties }) {
  const [ripples,setRipples]=useState<{id:number;x:number;y:number;s:number}[]>([]);
  const bRef=useRef<HTMLButtonElement>(null);
  const click=(e:React.MouseEvent<HTMLButtonElement>)=>{
    if(!bRef.current)return;
    const r=bRef.current.getBoundingClientRect();
    const s=Math.max(r.width,r.height)*2,id=Date.now();
    setRipples(p=>[...p,{id,x:e.clientX-r.left-s/2,y:e.clientY-r.top-s/2,s}]);
    setTimeout(()=>setRipples(p=>p.filter(x=>x.id!==id)),700); onClick?.();
  };
  return (
    <button ref={bRef} onClick={click} style={{position:"relative",overflow:"hidden",display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:999,fontWeight:500,fontSize:14,cursor:"pointer",backgroundImage:variant==="primary"?"linear-gradient(135deg,#4f46e5,#7c3aed)":"none",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",backgroundColor:"transparent",border:variant==="outline"?`1.5px solid ${T.bdr2}`:"none",color:variant==="primary"?"white":T.tx,boxShadow:variant==="primary"?"0 4px 20px rgba(79,70,229,.3)":"none",...style}}>
      {ripples.map(r=><span key={r.id} style={{position:"absolute",borderRadius:"50%",left:r.x,top:r.y,width:r.s,height:r.s,backgroundImage:"none",backgroundColor:variant==="primary"?"rgba(255,255,255,.28)":"rgba(79,70,229,.1)",transform:"scale(0)",animation:"rippleOut .65s ease-out forwards",pointerEvents:"none"}}/>)}
      <span style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:8}}>{children}</span>
    </button>
  );
}

// ── RAINBOW BUTTON ───────────────────────────
function RainbowBtn({ children, onClick }: { children:React.ReactNode; onClick?:()=>void }) {
  return (
    <button onClick={onClick} style={{position:"relative",overflow:"hidden",display:"inline-flex",alignItems:"center",gap:8,padding:"12px 26px",borderRadius:999,fontWeight:600,fontSize:14,cursor:"pointer",backgroundImage:"none",backgroundColor:"transparent",border:"none",color:"white",zIndex:0}}>
      <span style={{position:"absolute",inset:"-2px",backgroundImage:"conic-gradient(from var(--ra) at 50% 50%,#4f46e5,#7c3aed,#ec4899,#f59e0b,#10b981,#0891b2,#4f46e5)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",animation:"rainbowSpin 3s linear infinite",borderRadius:999,zIndex:-2}}/>
      <span style={{position:"absolute",inset:2,borderRadius:999,backgroundColor:"#1e1b4b",zIndex:-1}}/>
      <span style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:8}}>{children}</span>
    </button>
  );
}

// ── SHINE BORDER ─────────────────────────────
function ShineBorder({ children, style={} }: { children:React.ReactNode; style?:React.CSSProperties }) {
  return (
    <div style={{borderRadius:17,padding:"1.5px",backgroundImage:"conic-gradient(from var(--sa) at 50% 50%,transparent 0%,#4f46e5 8%,#7c3aed 16%,#0891b2 24%,transparent 32%)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",animation:"shineSpin 3.5s linear infinite",...style}}>
      <div style={{borderRadius:16,background:T.card,height:"100%",width:"100%"}}>{children}</div>
    </div>
  );
}

// ── BORDER BEAM ──────────────────────────────
function BeamCard({ children, style={} }: { children:React.ReactNode; style?:React.CSSProperties }) {
  return (
    <div style={{borderRadius:17,padding:"1.5px",backgroundImage:"conic-gradient(from var(--ba) at 50% 50%,transparent 0%,#4f46e5 5%,#7c3aed 10%,#06b6d4 15%,transparent 22%)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat",animation:"bspin 4s linear infinite",...style}}>
      <div style={{borderRadius:16,background:T.card,height:"100%",width:"100%"}}>{children}</div>
    </div>
  );
}

// ── MAGIC CARD ───────────────────────────────
function MagicCard({ children, style={}, glow="rgba(79,70,229,.08)" }: { children:React.ReactNode; style?:React.CSSProperties; glow?:string }) {
  const ref=useRef<HTMLDivElement>(null);
  const [pos,setPos]=useState({x:0,y:0}); const [hov,setHov]=useState(false);
  return (
    <div ref={ref} onMouseMove={e=>{if(!ref.current)return;const r=ref.current.getBoundingClientRect();setPos({x:e.clientX-r.left,y:e.clientY-r.top});}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{borderRadius:16,overflow:"hidden",border:`1px solid ${hov?"rgba(79,70,229,.2)":T.bdr}`,background:hov?`radial-gradient(300px at ${pos.x}px ${pos.y}px,${glow},transparent 70%),${T.card}`:T.card,transition:"border-color .22s,background .22s,transform .22s,box-shadow .22s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?"0 14px 40px rgba(0,0,0,.09)":"none",...style}}>
      {children}
    </div>
  );
}

// ── NEON CARD ────────────────────────────────
function NeonCard({ children, style={} }: { children:React.ReactNode; style?:React.CSSProperties }) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{borderRadius:20,padding:"2px",backgroundImage:hov?"linear-gradient(135deg,#4f46e5,#7c3aed,#0891b2,#4f46e5)":"linear-gradient(135deg,rgba(79,70,229,.3),rgba(124,58,237,.2))",backgroundSize:"300% 300%",backgroundRepeat:"no-repeat",animation:hov?"gshift 2s ease infinite":"none",boxShadow:hov?"0 0 60px rgba(79,70,229,.2)":"none",transition:"box-shadow .4s",...style}}>
      <div style={{borderRadius:18,background:T.card,padding:"36px 40px"}}>{children}</div>
    </div>
  );
}

// ── WARP BG ──────────────────────────────────
function WarpBg({ children }: { children:React.ReactNode }) {
  return (
    <div style={{position:"relative",overflow:"hidden",borderRadius:24,padding:"60px 40px"}}>
      {[1,2,3,4,5].map(i=>(
        <div key={i} style={{position:"absolute",width:`${220+i*80}px`,height:`${220+i*80}px`,borderRadius:"50%",border:`1px solid rgba(79,70,229,${.12-i*.02})`,top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:`warpPulse ${3+i*.4}s ease-in-out ${i*.3}s infinite`}}/>
      ))}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse 80% 60% at 50% 50%,rgba(79,70,229,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2}}>{children}</div>
    </div>
  );
}

// ── PULSATING BUTTON ─────────────────────────
function PulsatingBtn({ children, color="#4f46e5", onClick }: { children:React.ReactNode; color?:string; onClick?:()=>void }) {
  return (
    <button onClick={onClick} style={{position:"relative",display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:999,fontWeight:500,fontSize:14,cursor:"pointer",backgroundImage:"none",backgroundColor:color,border:"none",color:"white"}}>
      <span style={{position:"absolute",inset:0,borderRadius:999,backgroundColor:color,animation:"pulseRing 1.8s ease-out infinite",opacity:.5}}/>
      <span style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:8}}>{children}</span>
    </button>
  );
}

// ── ANIMATED CIRCULAR PROGRESS ───────────────
function CircProgress({ value, label, img, color="#4f46e5", size=76 }: { value:number; label:string; img?:string; color?:string; size?:number }) {
  const [anim,setAnim]=useState(0); const ref=useRef<HTMLDivElement>(null); const done=useRef(false);
  const R=(size-8)/2; const circ=2*Math.PI*R;
  useEffect(()=>{
    const io=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!done.current){done.current=true;let t0:number|undefined;
        const step=(ts:number)=>{if(!t0)t0=ts;const p=Math.min((ts-t0)/1300,1);setAnim(Math.round((1-(1-p)**3)*value));if(p<1)requestAnimationFrame(step);};
        requestAnimationFrame(step);}},{threshold:.5});
    if(ref.current)io.observe(ref.current); return()=>io.disconnect();
  },[value]);
  return (
    <div ref={ref} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={T.bdr2} strokeWidth={5}/>
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ-(anim/100)*circ} strokeLinecap="round" style={{transition:"stroke-dashoffset .08s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {img?<img src={img} alt={label} width={20} height={20} style={{objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>:<span style={{fontSize:10,fontWeight:700,color}}>{anim}%</span>}
        </div>
      </div>
      <div style={{fontSize:11,color:T.tx2,textAlign:"center",fontWeight:500,maxWidth:68}}>{label}</div>
      <div style={{fontSize:11,color,fontWeight:700}}>{anim}%</div>
    </div>
  );
}

// ── FILE TREE ─────────────────────────────────
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

// ── TERMINAL ─────────────────────────────────
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
        <div key={i} style={{color:clr(l.kind),animation:"flickerIn .25s ease"}}>
          <span style={{opacity:.5}}>{pfx(l.kind)}</span>{l.text}
        </div>
      ))}
      {vis<lines.length&&<span style={{color:"#818cf8"}}>█</span>}
    </div>
  );
}

// ── DOTTED MAP ───────────────────────────────
const LAND_COORDS: [number,number][] = [
  // North America
  [-125,49],[-120,49],[-115,49],[-110,49],[-105,49],[-100,49],[-95,49],[-90,49],[-85,49],[-80,49],[-75,49],[-70,49],
  [-130,48],[-125,48],[-120,47],[-115,46],[-110,45],[-105,44],[-100,44],[-95,44],[-90,44],[-85,44],[-80,44],[-75,44],[-70,44],[-65,44],
  [-125,45],[-124,43],[-122,40],[-120,37],[-118,34],[-117,32],
  [-105,40],[-100,40],[-95,40],[-90,40],[-85,40],[-80,40],[-75,40],[-70,41],[-68,44],[-66,45],
  [-105,35],[-100,35],[-95,34],[-90,35],[-85,35],[-80,35],[-77,35],[-75,36],[-73,40],[-71,41],[-70,42],
  [-98,30],[-96,30],[-94,30],[-90,30],[-88,30],[-85,30],[-82,28],[-80,26],[-80,25],
  [-100,28],[-98,26],[-96,24],[-94,20],[-90,18],[-88,16],[-86,16],[-84,10],[-80,8],
  [-95,19],[-92,18],[-90,16],[-88,15],[-87,14],[-85,12],[-84,10],[-78,8],[-75,10],[-72,12],
  [-68,12],[-65,10],[-63,11],[-60,10],[-62,10],[-64,10],[-66,11],[-67,10],[-69,11],[-70,12],
  [-80,0],[-75,0],[-70,-2],[-65,-5],[-60,-5],[-55,-3],[-50,-1],[-48,0],[-44,-3],[-40,-3],[-36,-5],[-35,-8],
  [-75,-10],[-70,-10],[-65,-10],[-60,-10],[-55,-10],[-50,-10],[-45,-10],[-40,-10],[-38,-12],[-35,-12],
  [-72,-20],[-68,-20],[-64,-20],[-60,-20],[-56,-20],[-52,-20],[-48,-20],[-44,-20],[-40,-20],
  [-70,-30],[-66,-30],[-62,-30],[-58,-30],[-54,-30],[-50,-30],[-48,-28],[-44,-24],
  [-68,-40],[-64,-40],[-60,-40],[-56,-40],[-52,-40],[-48,-38],[-46,-36],
  [-65,-48],[-62,-50],[-60,-52],[-58,-54],[-65,-55],[-67,-54],
  // Europe
  [0,51],[2,51],[4,51],[6,51],[8,51],[10,51],[12,51],[14,51],[16,51],[18,51],[20,51],[22,51],[24,51],
  [-5,48],[-3,48],[-1,48],[0,48],[2,47],[4,47],[6,47],[8,47],[10,47],[12,47],[14,47],[16,47],[18,47],[20,47],[22,47],[24,47],
  [-8,52],[-6,52],[-4,52],[-2,52],[0,52],[2,52],
  [-8,54],[-6,54],[-4,54],[-2,54],[0,54],[2,54],[4,54],[6,54],[8,54],[10,54],[12,54],[14,54],
  [-5,56],[-3,56],[-2,56],[0,56],[2,56],[4,56],[6,56],[8,56],[10,56],[12,56],[14,56],[16,56],[18,56],[20,56],[22,56],[24,56],
  [0,44],[2,44],[4,44],[6,44],[8,44],[10,44],[12,44],[14,44],[16,44],[18,44],[20,44],[22,44],[24,44],[26,44],[28,44],
  [14,40],[16,40],[18,40],[20,40],[22,40],[24,40],[26,40],[28,40],
  [12,37],[14,38],[16,38],[18,38],[20,38],[22,38],[24,38],[26,38],[28,38],[30,38],
  [20,42],[22,42],[24,42],[26,42],[28,42],[30,42],[32,42],[34,42],[36,42],[38,42],[40,42],
  [20,46],[22,46],[24,46],[26,46],[28,46],[30,46],[32,46],[34,46],[36,46],
  [20,52],[22,52],[24,52],[26,52],[28,52],[30,52],[32,52],[34,52],[36,52],[38,52],
  [20,56],[22,56],[24,56],[26,56],[28,56],[30,56],[32,56],[34,56],[36,56],[38,56],[40,56],
  [20,60],[22,60],[24,60],[26,60],[28,60],[30,60],[32,60],[34,60],[36,60],[38,60],
  [20,64],[22,64],[24,64],[26,64],[28,64],[30,64],
  [10,58],[12,58],[14,58],[16,58],[18,58],[20,58],[22,58],[24,58],[26,58],[28,58],
  [10,62],[12,62],[14,62],[16,62],[18,62],[20,62],[22,62],[24,62],[26,62],[28,62],
  [10,66],[12,66],[14,66],[16,66],[18,66],[20,66],[22,66],[24,66],[26,66],[28,66],[30,66],
  [15,68],[18,68],[20,68],[22,68],[24,68],[26,68],[28,68],[30,68],
  [18,70],[20,70],[22,70],[24,70],[26,70],[28,70],[30,70],
  // Africa
  [-5,36],[-3,36],[-2,35],[0,35],[2,35],[4,34],[6,34],[8,34],[10,34],[12,33],[14,33],
  [-16,20],[-14,20],[-12,20],[-10,20],[-8,20],[-6,20],[-4,20],[-2,20],[0,20],[2,20],[4,20],[6,20],[8,20],[10,20],[12,20],[14,20],[16,20],[18,20],[20,20],
  [-16,15],[-14,15],[-12,14],[-10,14],[-8,14],[-6,12],[-4,12],[-2,12],[0,12],[2,12],[4,12],[6,12],[8,12],[10,12],[12,12],[14,12],[16,12],[18,12],[20,12],[22,12],[24,12],[26,12],[28,12],[30,12],[32,12],[34,12],[36,12],[38,12],[40,12],[42,12],
  [-16,10],[-14,10],[-12,10],[-10,10],[-8,10],[-6,10],[-4,10],[-2,10],[0,10],[2,10],[4,10],[6,10],[8,10],[10,10],[12,10],[14,10],[16,10],[18,10],[20,10],[22,10],[24,10],[26,10],[28,10],[30,10],[32,10],[34,10],[36,10],[38,10],[40,10],[42,10],[44,10],
  [-16,5],[-14,5],[-12,5],[-10,5],[-8,5],[-6,5],[-4,5],[-2,5],[0,5],[2,5],[4,5],[6,5],[8,5],[10,5],[12,5],[14,5],[16,5],[18,5],[20,5],[22,5],[24,5],[26,5],[28,5],[30,5],[32,5],[34,5],[36,5],[38,5],[40,5],[42,5],[44,5],
  [-14,0],[-12,0],[-10,0],[-8,0],[-6,0],[-4,0],[-2,0],[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],[20,0],[22,0],[24,0],[26,0],[28,0],[30,0],[32,0],[34,0],[36,0],[38,0],[40,0],
  [10,-5],[12,-5],[14,-5],[16,-5],[18,-5],[20,-5],[22,-5],[24,-5],[26,-5],[28,-5],[30,-5],[32,-5],[34,-5],[36,-5],[38,-5],[40,-5],
  [14,-10],[16,-10],[18,-10],[20,-10],[22,-10],[24,-10],[26,-10],[28,-10],[30,-10],[32,-10],[34,-10],[36,-10],[38,-10],
  [14,-15],[16,-15],[18,-15],[20,-15],[22,-15],[24,-15],[26,-15],[28,-15],[30,-15],[32,-15],[34,-15],[36,-15],
  [16,-20],[18,-20],[20,-20],[22,-20],[24,-20],[26,-20],[28,-20],[30,-20],[32,-20],[34,-20],
  [18,-25],[20,-25],[22,-25],[24,-25],[26,-25],[28,-25],[30,-25],[32,-25],[34,-25],
  [18,-30],[20,-30],[22,-30],[24,-30],[26,-30],[28,-30],[30,-30],[32,-30],
  [18,-34],[20,-34],[22,-34],[24,-34],[26,-34],[28,-34],
  [32,2],[34,2],[36,2],[38,2],[40,2],[42,2],[44,2],
  [36,8],[38,8],[40,8],[42,8],[44,8],[46,8],
  [36,14],[38,14],[40,14],[42,14],[44,14],
  // Asia West
  [36,32],[38,32],[40,32],[42,32],[44,32],[46,32],[48,32],[50,32],[52,32],[54,32],[56,32],[58,32],[60,32],
  [36,36],[38,36],[40,36],[42,36],[44,36],[46,36],[48,36],[50,36],[52,36],[54,36],[56,36],[58,36],[60,36],
  [44,42],[46,42],[48,42],[50,42],[52,42],[54,42],[56,42],[58,42],[60,42],
  [48,46],[50,46],[52,46],[54,46],[56,46],[58,46],[60,46],[62,46],[64,46],
  [56,24],[58,24],[60,24],[62,24],[64,24],[66,24],
  [44,20],[46,20],[48,20],[50,20],[52,20],[54,20],[56,20],[58,20],[60,20],[62,20],[64,20],
  // Central & South Asia
  [60,26],[62,26],[64,26],[66,26],[68,26],[70,26],[72,26],[74,26],[76,26],[78,26],[80,26],
  [60,30],[62,30],[64,30],[66,30],[68,30],[70,30],[72,30],[74,30],[76,30],[78,30],[80,30],
  [60,36],[62,36],[64,36],[66,36],[68,36],[70,36],[72,36],[74,36],[76,36],[78,36],[80,36],
  [60,40],[62,40],[64,40],[66,40],[68,40],[70,40],[72,40],[74,40],[76,40],[78,40],[80,40],
  [60,44],[62,44],[64,44],[66,44],[68,44],[70,44],[72,44],[74,44],[76,44],[78,44],[80,44],
  [64,50],[66,50],[68,50],[70,50],[72,50],[74,50],[76,50],[78,50],[80,50],
  [68,22],[70,22],[72,22],[74,22],[76,22],[78,22],[80,22],[82,22],[84,22],[86,22],[88,22],[90,22],
  [70,18],[72,18],[74,18],[76,18],[78,18],[80,18],[82,18],[84,18],[86,18],[88,18],[90,18],
  // East Asia
  [80,28],[82,28],[84,28],[86,28],[88,28],[90,28],[92,28],[94,28],[96,28],[98,28],
  [80,32],[82,32],[84,32],[86,32],[88,32],[90,32],[92,32],[94,32],[96,32],[98,32],[100,32],[102,32],[104,32],
  [80,36],[82,36],[84,36],[86,36],[88,36],[90,36],[92,36],[94,36],[96,36],[98,36],[100,36],[102,36],[104,36],[106,36],[108,36],[110,36],[112,36],
  [80,40],[82,40],[84,40],[86,40],[88,40],[90,40],[92,40],[94,40],[96,40],[98,40],[100,40],[102,40],[104,40],[106,40],[108,40],[110,40],[112,40],[114,40],[116,40],[118,40],[120,40],
  [84,44],[86,44],[88,44],[90,44],[92,44],[94,44],[96,44],[98,44],[100,44],[102,44],[104,44],[106,44],[108,44],[110,44],[112,44],[114,44],[116,44],[118,44],[120,44],[122,44],[124,44],[126,44],[128,44],[130,44],[132,44],[134,44],[136,44],[138,44],[140,44],
  [96,50],[98,50],[100,50],[102,50],[104,50],[106,50],[108,50],[110,50],[112,50],[114,50],[116,50],[118,50],[120,50],[122,50],[124,50],[126,50],[128,50],[130,50],[132,50],[134,50],[136,50],[138,50],[140,50],
  [100,55],[102,55],[104,55],[106,55],[108,55],[110,55],[112,55],[114,55],[116,55],[118,55],[120,55],[122,55],[124,55],[126,55],[128,55],[130,55],[132,55],[134,55],[136,55],[138,55],[140,55],
  [100,60],[104,60],[108,60],[112,60],[116,60],[120,60],[124,60],[128,60],[132,60],[136,60],[140,60],
  [108,30],[110,30],[112,30],[114,30],[116,30],[118,30],[120,30],[122,30],[124,30],[126,30],[128,30],[130,30],
  [110,24],[112,24],[114,24],[116,24],[118,24],[120,24],[122,24],[124,24],
  [112,20],[114,20],[116,20],[118,20],[120,20],[108,18],[110,18],[112,16],[114,10],[116,8],
  [118,4],[120,2],[122,2],[124,4],[126,6],[128,8],[130,10],
  [126,34],[128,34],[130,34],[132,34],[134,34],[136,34],[138,34],[140,34],[142,34],[144,34],
  [126,38],[128,38],[130,38],[132,38],[134,38],[136,38],[138,38],[140,38],[142,38],[144,38],
  // Southeast Asia
  [100,2],[102,2],[104,2],[106,2],[108,2],[100,4],[102,4],[104,4],[106,4],[108,4],[110,4],
  [96,16],[98,18],[100,16],[102,14],[104,12],[106,10],[108,8],[110,6],
  [98,20],[100,20],[102,20],[104,18],[106,16],[108,14],[110,12],
  [102,2],[104,0],[106,-2],[108,-4],[110,-6],[112,-8],[114,-8],[116,-6],[118,-4],[120,-2],[122,-2],
  [114,-2],[116,-4],[118,-6],[120,-8],[124,2],[126,4],[128,2],[130,-2],
  [120,14],[122,14],[124,16],[126,10],[128,8],[130,6],[132,4],[134,2],[136,0],[138,-2],
  // Russia / North Asia
  [40,52],[42,52],[44,52],[46,52],[48,52],[50,52],[52,52],[54,52],[56,52],[58,52],[60,52],
  [60,56],[62,56],[64,56],[66,56],[68,56],[70,56],[72,56],[74,56],[76,56],[78,56],[80,56],
  [60,60],[64,60],[68,60],[72,60],[76,60],[80,60],[84,60],[88,60],[92,60],[96,60],[100,60],[104,60],[108,60],[112,60],[116,60],[120,60],[124,60],[128,60],[132,60],[136,60],[140,60],
  [60,64],[64,64],[68,64],[72,64],[76,64],[80,64],[84,64],[88,64],[92,64],[96,64],[100,64],[104,64],[108,64],[112,64],[116,64],[120,64],[124,64],[128,64],[132,64],[136,64],[140,64],
  [60,68],[64,68],[68,68],[72,68],[76,68],[80,68],[84,68],[88,68],[92,68],[96,68],[100,68],[104,68],[108,68],[112,68],[116,68],[120,68],[124,68],[128,68],[132,68],[136,68],[140,68],
  // Australia
  [114,-22],[116,-22],[118,-22],[120,-22],[122,-22],[124,-22],[126,-22],[128,-22],[130,-22],[132,-22],[134,-22],[136,-22],[138,-22],
  [114,-26],[116,-26],[118,-26],[120,-26],[122,-26],[124,-26],[126,-26],[128,-26],[130,-26],[132,-26],[134,-26],[136,-26],[138,-26],[140,-26],[142,-26],[144,-26],[146,-26],[148,-26],
  [116,-30],[118,-30],[120,-30],[122,-30],[124,-30],[126,-30],[128,-30],[130,-30],[132,-30],[134,-30],[136,-30],[138,-30],[140,-30],[142,-30],[144,-30],[146,-30],[148,-30],
  [118,-34],[120,-34],[122,-34],[124,-34],[126,-34],[128,-34],[130,-34],[132,-34],[134,-34],[136,-34],[138,-34],[140,-34],[142,-34],[144,-34],[146,-34],[148,-34],
  [140,-22],[142,-22],[144,-22],[146,-22],[148,-22],[150,-22],[152,-22],[154,-22],
  [142,-16],[144,-16],[146,-16],[148,-16],[150,-16],[152,-16],
  [148,-38],[150,-38],[152,-38],[154,-38],
  // Japan & Korea
  [128,34],[130,34],[132,34],[134,34],[136,34],[138,34],[140,34],[142,34],[144,34],
  [126,36],[128,36],[130,36],[132,36],[134,36],[136,36],[138,36],[140,36],[142,36],[144,36],
  [140,40],[142,40],[144,40],[140,42],[142,42],[144,42],
  [126,34],[128,34],[130,32],[132,32],[134,32],[136,30],[134,30],
  [128,26],[130,26],[128,24],[130,24],[132,24],
];

function DottedMap({ opacity=1 }: { opacity?:number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width = c.offsetWidth;
    const H = c.height = c.offsetHeight;

    const project = (lon: number, lat: number) => ({
      x: (lon + 180) * (W / 360),
      y: (90 - lat) * (H / 180),
    });

    ctx.clearRect(0, 0, W, H);
    for (const [lon, lat] of LAND_COORDS) {
      const { x, y } = project(lon, lat);
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(79,70,229,0.4)";
      ctx.fill();
    }

    // highlight Malaysia dot
    const my = project(109.5, 3.5);
    ctx.beginPath();
    ctx.arc(my.x, my.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,70,229,0.9)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(my.x, my.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,70,229,0.25)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(my.x, my.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,70,229,0.1)";
    ctx.fill();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"block", opacity }}
    />
  );
}

// ── MARQUEE ──────────────────────────────────
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



// ════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════
const PROJECTS: {
  id:string; icon:string; title:string; imgs:string[]; sub:string;
  color:string; colorRaw:string; desc:string;
  stats:{v:number;sfx:string;l:string}[];
  features:string[];
  techs:{n:string;img:string;v:number;c:string}[];
  tree:FileNode[];
}[] = [
  {
    id:"awam", icon:"🇲🇾", title:"Portal Awam PADU",
    imgs:["/images/portal-awam-1.png","/images/portal-awam-2.png","/images/portal-awam-3.png"],
    sub:"Public Portal · padu-portal-awam-v2",
    color:T.ind, colorRaw:"79,70,229",
    desc:"Portal awam rasmi Pangkalan Data Utama Malaysia. Antara muka utama untuk rakyat Malaysia mengakses maklumat sosio-ekonomi, semak status, dan berinteraksi dengan sistem PADU.",
    stats:[{v:100,sfx:"k+",l:"Daily Users"},{v:20,sfx:"+",l:"Pages"},{v:4,sfx:"",l:"Core Services"}],
    features:["20+ animated page modules","3D carousel (SejarahPaduPage)","PADUServices animated infographics","KolaborasiStrategik agency grid","Media & press release pages","Responsive across all breakpoints","Framer Motion animations","HeroUI component library"],
    techs:[
      {n:"Next.js 15",img:"https://cdn.simpleicons.org/nextdotjs/111111",v:94,c:"#111"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript",v:89,c:"#3178c6"},
      {n:"Tailwind",img:"https://cdn.simpleicons.org/tailwindcss",v:92,c:"#06b6d4"},
      {n:"HeroUI",img:"https://cdn.simpleicons.org/heroui/111111",v:85,c:"#111"},
      {n:"Framer",img:"https://cdn.simpleicons.org/framer/111111",v:82,c:"#111"},
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
    id:"panduan", icon:"📖", title:"Portal Panduan Pengguna",
    imgs:["/images/portal-panduan-1.png","/images/portal-panduan-2.png"],
    sub:"User Guide Portal · Strapi CMS",
    color:T.vio, colorRaw:"124,58,237",
    desc:"Portal panduan pengguna rasmi dengan headless CMS menggunakan Strapi. Membolehkan pengurusan kandungan dinamik oleh admin tanpa perlu kod, dilengkapi autentikasi selamat.",
    stats:[{v:3,sfx:"",l:"CMS Modules"},{v:100,sfx:"%",l:"Dynamic Content"},{v:1,sfx:"",l:"OAuth Provider"}],
    features:["Strapi headless CMS integration","RESTful API content fetching","Google OAuth 2.0 authentication","Government staff access control","Dynamic page rendering","Content editor friendly","SEO optimized structure","Secure role-based access"],
    techs:[
      {n:"Next.js",img:"https://cdn.simpleicons.org/nextdotjs/111111",v:90,c:"#111"},
      {n:"Strapi",img:"https://cdn.simpleicons.org/strapi",v:85,c:"#8c4bff"},
      {n:"Google OAuth",img:"https://cdn.simpleicons.org/google",v:88,c:"#4285f4"},
      {n:"REST API",img:"https://cdn.simpleicons.org/fastapi",v:82,c:"#009688"},
      {n:"MySQL",img:"https://cdn.simpleicons.org/mysql",v:75,c:"#4169e1"},
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
    id:"chatbot", icon:"🤖", title:"AI Chatbot (MyINFO & PADU)",
    imgs:["/images/chatbot-1.png","/images/chatbot-2.png"],
    sub:"Vertex AI · Conversational Agent",
    color:T.cyn, colorRaw:"8,145,178",
    desc:"AI-powered chatbot dibangunkan menggunakan Google Vertex AI Conversational Agents untuk MyINFO dan Portal PADU. Meningkatkan interaksi pengguna dan aksesibiliti maklumat secara automatik.",
    stats:[{v:2,sfx:"",l:"Portals Integrated"},{v:24,sfx:"/7",l:"Availability"},{v:100,sfx:"%",l:"AI Powered"}],
    features:["Google Vertex AI Conversational Agents","Natural language understanding","Integrated into MyINFO portal","Integrated into Portal PADU","Dialogflow-compatible intents","Custom Lottie animation icon","Shadow DOM CSS injection","Auto-refresh on session close"],
    techs:[
      {n:"Vertex AI",img:"https://cdn.simpleicons.org/googlecloud",v:78,c:"#4285f4"},
      {n:"Dialogflow",img:"https://cdn.simpleicons.org/dialogflow",v:80,c:"#ff9800"},
      {n:"LottieFiles",img:"https://cdn.simpleicons.org/lottiefiles",v:85,c:"#00ddb4"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript",v:88,c:"#3178c6"},
      {n:"Next.js",img:"https://cdn.simpleicons.org/nextdotjs/111111",v:90,c:"#111"},
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

// ── PROJECT CARD ─────────────────────────────
function ProjectSection({ proj }: { proj:typeof PROJECTS[0] }) {
  const icons: Record<string,React.ReactNode> = {
    "awam":    <Globe    size={22} color={proj.color}/>,
    "panduan": <BookOpen size={22} color={proj.color}/>,
    "chatbot": <Bot      size={22} color={proj.color}/>,
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>

      {/* ── HEADER BAR ── */}
      <BlurFade delay={0.05}>
        <div style={{display:"flex",alignItems:"center",gap:16,padding:"18px 22px",borderRadius:16,border:`1px solid ${T.bdr}`,background:T.card}}>
          <div style={{borderRadius:12,backgroundColor:`rgba(${proj.colorRaw},.1)`,backgroundImage:"none",border:`1.5px solid rgba(${proj.colorRaw},.2)`,padding:11,flexShrink:0}}>
            {icons[proj.id]}
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <span style={{fontWeight:700,color:T.tx,fontSize:15}}>{proj.title}</span>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:999,backgroundColor:`rgba(${proj.colorRaw},.1)`,backgroundImage:"none",border:`1px solid rgba(${proj.colorRaw},.22)`,color:proj.color,fontWeight:600}}>Active</span>
            </div>
            <div style={{fontSize:12,color:T.tx3}}>{proj.sub}</div>
          </div>
          <div style={{display:"flex",gap:24,flexShrink:0}}>
            {proj.stats.map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontWeight:800,fontSize:17,color:proj.color}}><Ticker to={s.v} sfx={s.sfx}/></div>
                <div style={{fontSize:10,color:T.tx3,marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* ── ROW 1: desc (span 2) + features (span 1) — equal height ── */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>

        {/* Description — Shine Border */}
        <BlurFade delay={0.08}>
          <ShineBorder style={{height:"100%"}}>
            <div style={{padding:24,height:"100%",display:"flex",flexDirection:"column",gap:14}}>
              <p style={{fontSize:13.5,color:T.tx2,lineHeight:1.82}}>{proj.desc}</p>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {proj.features.slice(0,4).map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:7}}>
                    <CheckCircle2 size={12} color={proj.color} style={{flexShrink:0}}/>
                    <span style={{fontSize:12.5,color:T.tx2}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </ShineBorder>
        </BlurFade>

        {/* Key Features — Border Beam */}
        <BlurFade delay={0.12}>
          <BeamCard style={{height:"100%"}}>
            <div style={{padding:22,height:"100%",display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:10,color:T.tx3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14,fontWeight:600}}>Key Features</div>
              <div style={{display:"flex",flexDirection:"column",gap:9,flex:1}}>
                {proj.features.slice(4).map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7}}>
                    <CheckCircle2 size={12} color={proj.color} style={{flexShrink:0,marginTop:2}}/>
                    <span style={{fontSize:12.5,color:T.tx2,lineHeight:1.55}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </BeamCard>
        </BlurFade>
      </div>

      {/* ── ROW 2: screenshots grid ── */}
      <BlurFade delay={0.14}>
        <MagicCard style={{padding:16,overflow:"hidden"}} glow={`rgba(${proj.colorRaw},.07)`}>
          <div style={{fontSize:10,color:T.tx3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,fontWeight:600}}>
            Project Screenshots · {proj.imgs.length} image{proj.imgs.length>1?"s":""}
          </div>
          <div style={{
            display:"grid",
            gridTemplateColumns: proj.imgs.length === 1 ? "1fr" : proj.imgs.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
            gap:10,
          }}>
            {proj.imgs.map((imgSrc, si) => (
              <div key={si} style={{borderRadius:10,overflow:"hidden",border:`1px solid ${T.bdr2}`,boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
                {/* browser chrome */}
                <div style={{background:"#f1efe9",padding:"7px 12px",display:"flex",alignItems:"center",gap:7,borderBottom:`1px solid ${T.bdr}`}}>
                  <div style={{display:"flex",gap:4}}>
                    {["#ef4444","#f59e0b","#22c55e"].map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}
                  </div>
                  <div style={{flex:1,background:"rgba(0,0,0,.05)",borderRadius:5,padding:"2px 8px",fontSize:10,color:T.tx3,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                    padu.gov.my
                  </div>
                </div>
                {/* image */}
                <div style={{position:"relative",width:"100%",aspectRatio:"16/9",background:`rgba(${proj.colorRaw},.04)`,overflow:"hidden"}}>
                  <img
                    src={imgSrc}
                    alt={`${proj.title} screenshot ${si+1}`}
                    style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top",display:"block"}}
                    onError={e=>{
                      const el=e.target as HTMLImageElement;
                      el.style.display="none";
                      const p=el.parentElement!;
                      p.style.display="flex";
                      p.style.alignItems="center";
                      p.style.justifyContent="center";
                      p.style.flexDirection="column";
                      p.style.gap="8px";
                      p.innerHTML=`<div style="font-size:28px">${proj.icon}</div><div style="font-size:10px;color:#aaa;font-family:system-ui;text-align:center;padding:0 8px">Screenshot ${si+1}<br/><code style="background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px;font-size:9px">/public${imgSrc}</code></div>`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </MagicCard>
      </BlurFade>

      {/* ── ROW 2: tech stack + file tree — align to top, no forced equal height ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"start"}}>

        {/* Tech Stack — Magic Card (logos only, no percentage) */}
        <BlurFade delay={0.16}>
          <MagicCard style={{padding:24}} glow={`rgba(${proj.colorRaw},.06)`}>
            <div style={{fontSize:10,color:T.tx3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16,fontWeight:600}}>Technologies Used</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {proj.techs.map((t,i)=>(
                <div key={i} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:999,border:`1px solid ${T.bdr2}`,backgroundColor:T.bg,backgroundImage:"none",fontSize:12.5,color:T.tx2,fontWeight:500}}>
                  <img src={t.img} alt={t.n} width={15} height={15} style={{objectFit:"contain",flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                  {t.n}
                </div>
              ))}
            </div>
          </MagicCard>
        </BlurFade>

        {/* File Structure — Magic Card */}
        <BlurFade delay={0.2}>
          <MagicCard style={{padding:"20px 22px"}} glow={`rgba(${proj.colorRaw},.05)`}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${T.bdr}`}}>
              <FolderOpen size={13} color="#f59e0b"/>
              <span style={{fontSize:12,fontWeight:600,color:T.tx}}>File Structure</span>
            </div>
            <TreeNode node={{name:"padu-portal",type:"folder",children:proj.tree}} depth={0}/>
          </MagicCard>
        </BlurFade>
      </div>

    </div>
  );
}

// ════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════
export default function PaduPage() {
  const [activeProj, setActiveProj] = useState("awam");

  return (
    <>
      <style>{CSS}</style>
      <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:T.bg,minHeight:"100vh"}}>
        <ScrollProgress/>

        {/* ── HERO ── */}
        <section style={{position:"relative",minHeight:"82vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden",padding:"80px 24px 60px",textAlign:"center",background:T.bg}}>
          <RetroGrid/>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(79,70,229,.07) 0%,transparent 65%)",zIndex:1,pointerEvents:"none"}}/>
          <div style={{position:"relative",zIndex:10,maxWidth:760,display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
            <BlurFade delay={0}>
              <button onClick={()=>window.history.back()} style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:T.tx3,background:"none",border:`1px solid ${T.bdr2}`,borderRadius:999,padding:"6px 14px",cursor:"pointer",marginBottom:4}}>
                <ArrowLeft size={13}/>Kembali ke Portfolio
              </button>
            </BlurFade>
            <BlurFade delay={0.05}><ShinyBadge><Star size={11}/>Case Study · Unit PADU · Kementerian Ekonomi</ShinyBadge></BlurFade>
            <BlurFade delay={0.1}>
              <h1 style={{fontSize:"clamp(38px,6.5vw,72px)",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.06,color:T.tx}}>
                Projek <span className="aurora-text">PADU</span>
              </h1>
            </BlurFade>
            <BlurFade delay={0.15}>
              <p style={{maxWidth:520,fontSize:14.5,color:T.tx3,lineHeight:1.88}}>
                Tiga produk digital gov-tech yang saya bangunkan di{" "}
                <span style={{color:T.ind,fontWeight:600}}>Unit PADU, Kementerian Ekonomi Malaysia</span>{" "}
                — Portal Awam, Portal Panduan Pengguna, dan AI Chatbot.
              </p>
            </BlurFade>

            {/* 3 project quick-nav pills */}
            <BlurFade delay={0.25}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:6}}>
                {PROJECTS.map(p=>(
                  <button key={p.id} onClick={()=>{setActiveProj(p.id);document.getElementById(p.id)?.scrollIntoView({behavior:"smooth"});}}
                    style={{display:"flex",alignItems:"center",gap:7,padding:"7px 16px",borderRadius:999,fontSize:13,fontWeight:500,cursor:"pointer",border:`1.5px solid ${activeProj===p.id?p.color:T.bdr2}`,backgroundColor:activeProj===p.id?`rgba(${p.colorRaw},.1)`:"transparent",backgroundImage:"none",color:activeProj===p.id?p.color:T.tx2,transition:"all .18s"}}>
                    <span>{p.icon}</span>{p.title}
                  </button>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* ── TECH STACK MARQUEE ── */}
        <div style={{background:T.card,borderTop:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`,padding:"20px 0",overflow:"hidden"}}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Marquee items={STACK_TOP}/>
            <Marquee items={STACK_BOT} rev/>
          </div>
        </div>

        {/* ── OVERVIEW STATS ── */}
        <section style={{background:T.bg2,padding:"64px 24px"}}>
          <div style={{maxWidth:920,marginLeft:"auto",marginRight:"auto"}}>
            <BlurFade>
              <div style={{textAlign:"center",marginBottom:40}}>
                <SBadge>Overview</SBadge>
                <h2 style={{fontSize:"clamp(22px,3.5vw,32px)",fontWeight:700,color:T.tx}}>
                  3 Projek · <span className="gtext">1 Platform</span>
                </h2>
              </div>
            </BlurFade>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {PROJECTS.map((p,i)=>(
                <BlurFade key={i} delay={i*0.08}>
                  <MagicCard style={{padding:24,cursor:"pointer"}} glow={`rgba(${p.colorRaw},.07)`}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{borderRadius:12,backgroundColor:`rgba(${p.colorRaw},.1)`,backgroundImage:"none",border:`1.5px solid rgba(${p.colorRaw},.2)`,padding:10,fontSize:20,flexShrink:0}}>{p.icon}</div>
                      <div>
                        <div style={{fontWeight:700,color:T.tx,fontSize:14}}>{p.title}</div>
                        <div style={{fontSize:11,color:p.color,fontWeight:500,marginTop:1}}>{p.sub}</div>
                      </div>
                    </div>
                    <p style={{fontSize:12.5,color:T.tx2,lineHeight:1.7,marginBottom:14}}>{p.desc.slice(0,120)}...</p>
                    <div style={{display:"flex",gap:14}}>
                      {p.stats.map((s,si)=>(
                        <div key={si}>
                          <div style={{fontWeight:800,fontSize:16,color:p.color}}><Ticker to={s.v} sfx={s.sfx}/></div>
                          <div style={{fontSize:10,color:T.tx3,marginTop:1}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </MagicCard>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 PROJECT SECTIONS ── */}
        {PROJECTS.map((proj, idx) => (
          <section key={proj.id} id={proj.id} style={{background:idx%2===0?T.bg:T.bg2,padding:"72px 24px",position:"relative",overflow:"hidden"}}>
            <div style={{maxWidth:920,marginLeft:"auto",marginRight:"auto",position:"relative",zIndex:2}}>
              <BlurFade>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
                  <div style={{width:4,height:36,borderRadius:999,backgroundColor:proj.color,backgroundImage:"none",flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:11,color:T.tx3,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:2}}>{`0${idx+1} — Sub-Project`}</div>
                    <h2 style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:700,color:T.tx}}>{proj.title}</h2>
                  </div>
                </div>
              </BlurFade>
              <ProjectSection proj={proj}/>
            </div>
          </section>
        ))}

        {/* ── TERMINAL + FILE STRUCTURE ── */}
        <section style={{background:T.bg,padding:"72px 24px"}}>
          <div style={{maxWidth:920,marginLeft:"auto",marginRight:"auto"}}>
            <BlurFade>
              <div style={{textAlign:"center",marginBottom:40}}>
                <SBadge>Codebase</SBadge>
                <h2 style={{fontSize:"clamp(22px,3.5vw,32px)",fontWeight:700,color:T.tx}}>Setup &amp; <span className="gtext">Dev Environment</span></h2>
              </div>
            </BlurFade>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <BlurFade delay={0}><Terminal lines={TERM_LINES}/></BlurFade>
              <BlurFade delay={0.1}>
                <MagicCard style={{padding:"20px 22px",height:"100%"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${T.bdr}`}}>
                    <FolderOpen size={15} color="#f59e0b"/>
                    <span style={{fontSize:13,fontWeight:600,color:T.tx}}>padu-portal-awam-v2</span>
                  </div>
                  <TreeNode node={{name:"padu-portal-awam-v2",type:"folder",children:[
                    {name:"app",type:"folder",children:[
                      {name:"(pages)",type:"folder",children:[{name:"beranda",type:"folder",children:[{name:"page.tsx",type:"file"}]},{name:"perkhidmatan",type:"folder",children:[{name:"page.tsx",type:"file"}]},{name:"panduan",type:"folder",children:[{name:"page.tsx",type:"file"}]}]},
                      {name:"api",type:"folder",children:[{name:"auth",type:"folder",children:[{name:"route.ts",type:"file"}]},{name:"content",type:"folder",children:[{name:"route.ts",type:"file"}]}]},
                      {name:"layout.tsx",type:"file"},{name:"page.tsx",type:"file"},
                    ]},
                    {name:"components",type:"folder",children:[
                      {name:"chatbot",type:"folder",children:[{name:"AIRAWidget.tsx",type:"file"}]},
                      {name:"sections",type:"folder",children:[{name:"PADUServices.tsx",type:"file"},{name:"SejarahPage.tsx",type:"file"}]},
                      {name:"ui",type:"folder",children:[{name:"Navbar.tsx",type:"file"},{name:"Footer.tsx",type:"file"}]},
                    ]},
                    {name:"lib",type:"folder",children:[{name:"strapi.ts",type:"file"},{name:"vertex-ai.ts",type:"file"},{name:"auth.ts",type:"file"}]},
                    {name:"next.config.ts",type:"file"},{name:"tailwind.config.ts",type:"file"},
                  ]}} depth={0}/>
                </MagicCard>
              </BlurFade>
            </div>
          </div>
        </section>


      </div>
    </>
  );
}