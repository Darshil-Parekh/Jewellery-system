export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <section
        className="confirmation-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirmation-title">{title}</h2>
        <p id="confirmation-description">{description}</p>
        <div className="dialog-actions">
          <button className="button-secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="button-primary" type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}
