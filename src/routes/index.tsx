import { createFileRoute } from '@tanstack/react-router'
import { Github, Globe } from 'lucide-react'
import data from '../data/portfolio.json'

export const Route = createFileRoute('/')({
  component: Portfolio,
})

function Portfolio() {
  const { masthead, lead_story, skills, projects, contact } = data

  return (
    <div className="min-h-screen bg-paper p-4 md:p-8 font-sans text-ink">
      <main className="max-w-[1400px] mx-auto bg-white shadow-2xl md:shadow-none min-h-screen md:min-h-0 border-x border-rule/50 md:border-none px-4 md:px-0">
        {/* MASTHEAD */}
        <header className="mb-8 pt-8">
          <div className="border-b-2 border-black mb-1 flex justify-between items-end pb-1 text-xs font-serif-text uppercase tracking-widest text-ink-light hidden md:flex">
            <span>{masthead.issue_date}</span>
            <span>{masthead.location}</span>
          </div>
          <h1 className="masthead-title">{masthead.name}</h1>
          <div className="border-b-4 border-double border-black mb-8 flex flex-col md:flex-row justify-center items-center py-2 text-sm font-serif-text italic relative">
            <span className="md:absolute md:left-0 uppercase not-italic font-bold text-xs tracking-wider md:block hidden">
              Vol. 1
            </span>
            <span className="text-lg">{masthead.title}</span>
            <span className="md:absolute md:right-0 uppercase not-italic font-bold text-xs tracking-wider md:block hidden">
              Price: Hiring
            </span>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT COLUMN: SKILLS (Span 3) */}
          <aside className="md:col-span-3 md:border-r border-rule md:pr-6">
            <h2 className="section-title text-lg">Technical Specs</h2>
            <div className="space-y-6">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-2 border-b border-rule/50 pb-1">
                    {category}
                  </h3>
                  <ul className="text-sm leading-relaxed space-y-1 font-serif-text">
                    {items.map((item) => (
                      <li key={item} className="p-0">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 p-4 border border-black bg-neutral-100/50 text-center sticky top-8">
              <p className="font-serif-display font-bold text-xl mb-2">
                Hire This Developer
              </p>
              <p className="text-sm font-serif-text italic mb-4">
                "A code craftsman waiting for the right opportunity."
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="inline-block bg-black text-white px-6 py-2 font-bold uppercase text-sm hover:bg-neutral-800 transition-colors"
              >
                Inquire Within
              </a>
            </div>
          </aside>

          {/* MIDDLE COLUMN: LEAD STORY & PROJECTS (Span 6) */}
          <section className="md:col-span-6">
            {/* LEAD STORY */}
            <article className="mb-12 border-b border-black pb-8">
              <span className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                Cover Story
              </span>
              <h2 className="font-serif-display text-4xl md:text-5xl font-bold leading-tight mb-4">
                {lead_story.headline}
              </h2>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Placeholder Image */}
                <img
                  src="/dev_1.JPEG"
                  alt="Developer at work (Symbolic)"
                  className="w-full md:w-1/3 h-52 bg-neutral-200 grayscale contrast-125 flex items-center justify-center border border-neutral-300"
                />
                <div className="w-full md:w-2/3">
                  <p className="font-serif-text text-lg leading-relaxed drop-cap mb-4 text-justify">
                    {lead_story.intro[0]}
                  </p>
                </div>
              </div>

              <p className="font-serif-text text-base leading-relaxed mb-6">
                {lead_story.intro[1]}
              </p>

              <blockquote className="border-l-4 border-black pl-6 py-2 my-8 font-serif-display text-2xl font-bold italic leading-tight text-neutral-800">
                "{lead_story.pull_quote}"
              </blockquote>
            </article>

            {/* PROJECTS SECTION */}
            <div>
              <h2 className="section-title">Notable Projects</h2>
              <div className="grid grid-cols-1 gap-8 mt-6">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="pb-6 border-b border-rule last:border-0"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className={project.img && 'md:w-3/4'}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase bg-black text-white px-1">
                            {project.category}
                          </span>
                        </div>
                        <h3 className="article-headline text-2xl">
                          {project.title}
                        </h3>
                        <p className="font-serif-text text-sm leading-relaxed mb-3 text-neutral-600 line-clamp-3">
                          {project.description}
                        </p>
                        <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-3">
                          {project.tech.join(' / ')}
                        </p>

                        {/* Links Section */}
                        {(project.github_links.length > 0 ||
                          project.demo_link) && (
                          <div className="flex flex-wrap gap-3 mt-2">
                            {project.github_links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold uppercase border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                              >
                                <Github className="w-3 h-3" /> {link.label}
                              </a>
                            ))}
                            {project.demo_link && (
                              <a
                                href={project.demo_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold uppercase border border-black px-2 py-1 bg-neutral-100 hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" /> Live Demo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {project.img && (
                        <div className="md:w-1/4">
                          <img
                            src={project.img}
                            alt={project.title}
                            className="aspect-square object-cover bg-neutral-100 border border-neutral-200 flex items-center justify-center"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: SIDEBAR (Span 3) */}
          <aside className="md:col-span-3 md:border-l border-rule md:pl-6">
            <div className="mb-8">
              <h2 className="section-title text-base">Contact & Connect</h2>
              <ul className="space-y-3 font-serif-text text-sm">
                <li>
                  <span className="block font-bold text-xs uppercase tracking-wide text-neutral-500">
                    Email
                  </span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:underline underline-offset-2"
                  >
                    {contact.email}
                  </a>
                </li>
                <li>
                  <span className="block font-bold text-xs uppercase tracking-wide text-neutral-500">
                    GitHub
                  </span>
                  <a
                    href={`https://${contact.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline underline-offset-2"
                  >
                    {contact.github}
                  </a>
                </li>
                <li>
                  <span className="block font-bold text-xs uppercase tracking-wide text-neutral-500">
                    LinkedIn
                  </span>
                  <a
                    href={`https://${contact.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline underline-offset-2"
                  >
                    {contact.linkedin}
                  </a>
                </li>
              </ul>
            </div>

            <div className="border-t-4 border-black pt-4 mb-8">
              <h3 className="font-serif-display font-bold text-lg leading-tight mb-2">
                About The Paper
              </h3>
              <p className="font-serif-text text-xs leading-relaxed text-justify">
                This portfolio is designed with a "content-first" philosophy,
                stripping away modern web embellishments to focus on layout,
                typography, and information architecture. Inspired by the golden
                age of print journalism.
              </p>
            </div>

            <div className="border border-black p-2 text-center bg-neutral-50">
              <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Ad Space
              </span>
              <p className="font-serif-display font-bold text-sm">
                Now serving pixel-perfect web experiences.
              </p>
            </div>
          </aside>
        </div>

        {/* FOOTER */}
        <footer className="mt-16 border-t-4 border-double border-black pt-8 pb-16 text-center">
          <p className="font-serif-text italic text-sm text-neutral-500 mb-4">
            - 30 -
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            © 2025 {masthead.name}. All Rights Reserved.
          </p>
        </footer>
      </main>
    </div>
  )
}
