"use client";

import { type MouseEvent, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Copy, Menu, X } from "lucide-react";
import { chapters, type ChapterId, frameConfig, getChapterDestination, itemProgress } from "@/lib/portfolio-timeline";
import { email, experience, projects, skillGroups, socialLinks } from "@/lib/portfolio-data";
import { useFrameSequence } from "./use-frame-sequence";
import "./cinematic.css";

export default function CinematicPortfolio() {
  const { root, canvas, meter, chapterCounter, debug, loading, ready, retry, continueLoading, goTo } = useFrameSequence();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const percent = Math.round(loading.loaded / loading.total * 100);

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: ChapterId) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMenuOpen(false);
    window.history.replaceState(window.history.state, "", `#${id}`);
    goTo(getChapterDestination(id));
  }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(email); setCopyStatus("Email copied"); }
    catch { setCopyStatus("Please select and copy the email address."); }
  }

  return (
    <>
      <div className={`sequence-loader ${ready ? "is-ready" : ""}`} aria-hidden={ready} inert={ready}>
        <span className="loader-signature">ii<span>.</span></span>
        <div className="loader-content">
          <p className="eyebrow">A little perspective.</p>
          <p className="loader-title">Izzat Imran</p>
          <div className="loader-line" role="progressbar" aria-label="Loading animation" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <span style={{ transform: `scaleX(${percent / 100})` }} />
          </div>
          <div className="loader-meta"><span>LOADING THE EXPERIENCE</span><span>{percent}%</span></div>
          {loading.settled && loading.failed > 0 && <div className="load-error" role="alert">
            <p>{loading.loaded} of {loading.total} frames loaded. Some frames could not be reached.</p>
            <button onClick={retry}>Retry loading <ArrowUpRight size={14} /></button>
            <button onClick={continueLoading}>Continue {loading.loaded ? "with available frames" : "to portfolio"}</button>
          </div>}
        </div>
        <span className="loader-foot">WEB &amp; FRONTEND DEVELOPER · MALAYSIA</span>
      </div>

      <div className={`cinematic ${ready ? "is-ready" : ""}`} ref={root} tabIndex={-1} inert={!ready}>
        <a className="skip-link" href="#contact" onClick={event => navigate(event, "contact")}>Skip to contact</a>
        <canvas className="frame-canvas" ref={canvas} aria-hidden="true" />
        <div className="sequence-meter" ref={meter} aria-hidden="true" />
        <header className="portfolio-nav">
          <a className="wordmark" href="#hero" onClick={event => navigate(event, "hero")} aria-label="Izzat Imran, introduction">ii<span>.</span></a>
          <span className="nav-descriptor">IZZAT IMRAN<span>Web &amp; Frontend Developer</span></span>
          <nav className="desktop-nav" aria-label="Portfolio chapters">
            {chapters.slice(1).map(chapter => <a key={chapter.id} href={`#${chapter.id}`} data-nav={chapter.id} onClick={event => navigate(event, chapter.id)}>{chapter.label}</a>)}
          </nav>
          <a className="talk-link" href={`mailto:${email}`}>Let&apos;s talk <ArrowUpRight size={16} /></a>
          <button className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-chapters" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <nav id="mobile-chapters" className="mobile-nav" aria-label="Mobile portfolio chapters" hidden={!menuOpen} onKeyDown={event => { if (event.key === "Escape") { setMenuOpen(false); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); } }}>
            {chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} onClick={event => navigate(event, chapter.id)}><span>0{index + 1}</span>{chapter.label}<ArrowUpRight size={16} /></a>)}
          </nav>
        </header>
        <aside className="availability"><span />Open to opportunities</aside>

        <main className="portfolio-panels" aria-label="Izzat Imran portfolio">
          <section id="hero" className="story-panel hero-panel" data-chapter="hero" aria-labelledby="hero-heading">
            <p className="eyebrow"><span className="tiny-rule" />A DEVELOPER&apos;S PERSPECTIVE</p>
            <h1 id="hero-heading">IZZAT<br />IMRAN<span className="name-dot">.</span></h1>
            <p className="hero-role">Web &amp; Frontend<br /> Developer</p>
            <p className="body-copy hero-copy">Building government portals, AI chatbots, and digital experiences with purpose.</p>
            <a className="text-link hero-cta" href="#projects" onClick={event => navigate(event, "projects")}>Explore my work <ArrowUpRight size={17} /></a>
            <div className="hero-location"><span>BASED IN MALAYSIA</span><span>KAJANG, SELANGOR ↗</span></div>
          </section>
          <section id="about" className="story-panel" data-chapter="about" aria-labelledby="about-heading" inert aria-hidden="true">
            <p className="eyebrow">01 / THE PERSON BEHIND THE PIXELS</p>
            <h2 id="about-heading">Thoughtful code.<br /><span>Useful things.</span></h2>
            <div className="panel-scroll">
              <p className="body-copy">I&apos;m <strong>Muhammad Izzat Imran</strong>, a Computer Science graduate from Universiti Teknologi MARA, specialising in Netcentric Computing.</p>
              <p className="body-copy">At Unit PADU, Kementerian Ekonomi, I design and build interfaces for government portals, connect headless content with Strapi, and develop AI chatbots with Vertex AI.</p>
              <div className="education-list">
                <p className="eyebrow">EDUCATION / UiTM</p>
                <div><span><strong>Bachelor&apos;s CS (Hons)</strong><small>Netcentric Computing</small></span><time>2025</time></div>
                <div><span><strong>Diploma CS</strong><small>Computer Science</small></span><time>2022</time></div>
              </div>
              <p className="small-note">Based in Kajang · Working in Putrajaya</p>
            </div>
          </section>
          <section id="experience" className="story-panel" data-chapter="experience" aria-labelledby="experience-heading" inert aria-hidden="true">
            <p className="eyebrow">02 / WHERE I&apos;VE BUILT</p>
            <h2 id="experience-heading">Learning.<br /><span>By doing.</span></h2>
            <div className="item-selector" aria-label="Choose work experience">
              {experience.map((job, index) => <button key={job.company} data-experience-button aria-pressed={index === 0} onClick={() => goTo(itemProgress("experience", index, experience.length))}><span>0{index + 1}</span>{job.period}</button>)}
            </div>
            <div className="panel-scroll item-stack">
              {experience.map((job, index) => <article key={job.company} data-experience-item hidden={index !== 0} className="experience-entry">
                <p className="entry-overline">{job.period}{job.current ? " · CURRENT ROLE" : ""}</p>
                <h3>{job.role}</h3><p className="company-name">{job.company}</p><p className="small-note">{job.loc}</p>
                <ul className="accomplishments">{job.points.slice(0, 3).map(point => <li key={point}>{point}</li>)}</ul>
                {job.points.length > 3 && <details className="more-details"><summary>More from this role <span>+</span></summary><ul className="accomplishments">{job.points.slice(3).map(point => <li key={point}>{point}</li>)}</ul></details>}
              </article>)}
            </div>
          </section>
          <section id="projects" className="story-panel projects-panel" data-chapter="projects" aria-labelledby="projects-heading" inert aria-hidden="true">
            <p className="eyebrow">03 / FROM IDEA TO INTERFACE</p>
            <h2 id="projects-heading">Selected <span>work.</span></h2>
            <div className="project-selector" aria-label="Choose a project">{projects.map((project, index) => <button key={project.title} data-projects-button aria-label={`View ${project.title}`} aria-pressed={index === 0} onClick={() => goTo(itemProgress("projects", index, projects.length))}>{String(index + 1).padStart(2, "0")}</button>)}</div>
            <div className="panel-scroll item-stack">
              {projects.map((project, index) => <article className="project-entry" key={project.title} data-projects-item hidden={index !== 0}>
                <p className="entry-overline">{project.period} / {project.role}</p>
                <Link className="project-title" href={project.href}><h3>{project.title}</h3><ArrowUpRight size={22} /></Link>
                <p className="project-org">{project.org}</p>
                <p className="body-copy project-description">{project.desc}</p>
                <div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <details className="more-details"><summary>Behind the build <span>+</span></summary><ul className="accomplishments">{project.highlights.map(point => <li key={point}>{point}</li>)}</ul></details>
                <Link className="text-link case-study-link" href={project.href}>View case study <ArrowUpRight size={15} /></Link>
              </article>)}
            </div>
          </section>
          <section id="skills" className="story-panel" data-chapter="skills" aria-labelledby="skills-heading" inert aria-hidden="true">
            <p className="eyebrow">04 / TOOLS OF THE TRADE</p>
            <h2 id="skills-heading">The right tools.<br /><span>Real outcomes.</span></h2>
            <div className="panel-scroll skill-groups">{skillGroups.map((group, index) => <div className="skill-group" key={group.label}><h3><span>0{index + 1}</span>{group.label}</h3><ul>{group.items.map(skill => <li key={skill}>{skill}</li>)}</ul></div>)}</div>
          </section>
          <section id="contact" className="story-panel contact-panel" data-chapter="contact" aria-labelledby="contact-heading" inert aria-hidden="true">
            <p className="eyebrow">05 / THE NEXT CHAPTER</p>
            <h2 id="contact-heading">Let&apos;s build<br />something<br /><span>great.</span></h2>
            <div className="panel-scroll">
              <p className="body-copy">Have something in mind?<br />Let&apos;s make it happen.</p>
              <div className="email-row"><a href={`mailto:${email}`}>{email}<ArrowUpRight size={17} /></a><button onClick={copyEmail} aria-label="Copy email address">{copyStatus === "Email copied" ? <Check size={15} /> : <Copy size={15} />}</button></div>
              <p className="copy-status" role="status">{copyStatus}</p>
              <div className="social-links"><a href={socialLinks.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a><a href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a></div>
              <a className="phone-link" href="tel:+60122967752">+6012-296 7752</a>
              <p className="small-note">Kajang, Selangor · Malaysia</p>
            </div>
          </section>
        </main>
        <nav className="chapter-rail" aria-label="Scene navigation">{chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`} aria-label={chapter.label} data-nav={chapter.id} onClick={event => navigate(event, chapter.id)}><span>{chapter.label}</span><i /></a>)}</nav>
        <footer className="scene-footer">
          <a href="#about" className="scroll-invitation" onClick={event => navigate(event, "about")}><span className="scroll-icon"><ArrowDown size={14} /></span><span>Scroll to explore<small>AT YOUR OWN PACE</small></span></a>
          <span className="chapter-counter" ref={chapterCounter}>01 / 06 — Introduction</span>
        </footer>
        {process.env.NODE_ENV === "development" && <output ref={debug} hidden aria-hidden="true" className="timeline-debug" style={{ position: "fixed", zIndex: 50, right: 16, bottom: 72, padding: 12, background: "#f8f7f4ed", color: "#252721", font: "11px/1.7 monospace", whiteSpace: "pre", pointerEvents: "none", border: "1px solid #aaa" }} />}
        <div className="scroll-track" style={{ height: `${frameConfig.scrollVh}svh` }} aria-hidden="true" />
      </div>
      <noscript><div className="no-script"><h1>Muhammad Izzat Imran</h1><p>Web &amp; Frontend Developer · Unit PADU, Kementerian Ekonomi</p><p>This scroll experience needs JavaScript. You can still explore my case studies and get in touch.</p><a href="/projects/padu">PADU projects</a><a href="/projects/fyp-project">Smart Ticket System</a><a href="/projects/jejak">JEJAK</a><a href={`mailto:${email}`}>{email}</a></div><style>{`.sequence-loader,.cinematic{display:none!important}`}</style></noscript>
    </>
  );
}
