/* PADU project content. Moved verbatim from app/projects/padu/page.tsx. */

export interface FileNode { name: string; type: "file"|"folder"; children?: FileNode[]; }

export interface TechItem { n: string; img: string; }

/* Original accent colours, kept so each project retains its identity. */
const T = {
  ind:"#4f46e5", vio:"#7c3aed", cyn:"#0891b2",
  grn:"#16a34a", amb:"#d97706",
};

export interface PaduProject {
  id:string; idx:string; icon:string; title:string; imgs:string[]; sub:string;
  color:string; colorRaw:string; desc:string; url?:string; imgFit?:"cover"|"contain";
  internal?:boolean;
  stats:{v:number;sfx:string;l:string}[];
  features:string[];
  techs:TechItem[];
  tree:FileNode[];
}

export const PROJECTS: PaduProject[] = [
  {
    id:"awam", idx:"01", icon:"🇲🇾", title:"PADU Public Portal",
    imgs:["/newbannerpadu.png"],
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
  {
    id:"api", idx:"05", icon:"🔌", title:"Agency Data Integration API",
    imgs:[],
    sub:"Backend API · NestJS & Prisma ORM",
    internal:true,
    color:T.amb, colorRaw:"217,119,6",
    desc:"Developed and tested REST API endpoints for government agency data integration, including controller development, request DTOs, and role-based permission guards using NestJS and Prisma ORM. Conducted API testing via Postman to validate endpoint functionality, authentication, authorization, and response accuracy.",
    stats:[],
    features:["REST API endpoints for agency data integration","NestJS controller development","Request DTOs for input validation","Role-based permission guards","Prisma ORM data access","Postman API testing","Authentication & authorization checks","Response accuracy validation"],
    techs:[
      {n:"NestJS",img:"https://cdn.simpleicons.org/nestjs"},
      {n:"Prisma",img:"https://cdn.simpleicons.org/prisma/111111"},
      {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
      {n:"Postman",img:"https://cdn.simpleicons.org/postman"},
      {n:"REST API",img:"https://cdn.simpleicons.org/fastapi"},
    ],
    tree:[],
  },
];


export const STACK_TOP: TechItem[] = [
  {n:"Next.js 15",img:"https://cdn.simpleicons.org/nextdotjs/111111"},
  {n:"TypeScript",img:"https://cdn.simpleicons.org/typescript"},
  {n:"Tailwind CSS",img:"https://cdn.simpleicons.org/tailwindcss"},
  {n:"Strapi",img:"https://cdn.simpleicons.org/strapi"},
  {n:"Vertex AI",img:"https://cdn.simpleicons.org/googlecloud"},
  {n:"HeroUI",img:"https://cdn.simpleicons.org/heroui/111111"},
  {n:"Framer Motion",img:"https://cdn.simpleicons.org/framer/111111"},
  {n:"LottieFiles",img:"https://cdn.simpleicons.org/lottiefiles"},
];
export const STACK_BOT: TechItem[] = [
  {n:"Google OAuth",img:"https://cdn.simpleicons.org/google"},
  {n:"MySQL",img:"https://cdn.simpleicons.org/mysql"},
  {n:"Figma",img:"https://cdn.simpleicons.org/figma"},
  {n:"Git (OSDEC)",img:"https://cdn.simpleicons.org/git"},
  {n:"REST API",img:"https://cdn.simpleicons.org/fastapi"},
  {n:"Dialogflow",img:"https://cdn.simpleicons.org/dialogflow"},
  {n:"React",img:"https://cdn.simpleicons.org/react"},
  {n:"Node.js",img:"https://cdn.simpleicons.org/nodedotjs"},
  {n:"NestJS",img:"https://cdn.simpleicons.org/nestjs"},
  {n:"Prisma",img:"https://cdn.simpleicons.org/prisma/111111"},
  {n:"Postman",img:"https://cdn.simpleicons.org/postman"},
];
