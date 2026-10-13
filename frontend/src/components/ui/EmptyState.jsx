import { Inbox } from 'lucide-react'

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Inbox size={19} /></span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  )
}
