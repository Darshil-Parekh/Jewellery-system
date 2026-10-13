import { AlertCircle, RotateCw } from 'lucide-react'

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="text-action" onClick={onRetry}>
          <RotateCw size={14} /> Retry
        </button>
      )}
    </div>
  )
}
