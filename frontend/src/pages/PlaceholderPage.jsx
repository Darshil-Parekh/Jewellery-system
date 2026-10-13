import { ArrowUpRight, Sparkles } from 'lucide-react'

export function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
      </div>
      <article className="upcoming-card">
        <span className="upcoming-icon"><Sparkles size={19} /></span>
        <div>
          <span className="upcoming-label">IN THE WORKS</span>
          <h2>This part of your workspace is on its way.</h2>
          <p>Nothing is being simulated here. When this module is ready, its actions and records will connect to your business data.</p>
        </div>
        <ArrowUpRight className="upcoming-decoration" size={22} />
      </article>
    </section>
  )
}
