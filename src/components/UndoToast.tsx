interface Props {
  title: string | null
  onUndo: () => void
}

export function UndoToast({ title, onUndo }: Props) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {title !== null && (
        <div className="toast">
          <span className="toast__text">
            Удалена задача «{title}»
          </span>
          <button type="button" className="toast__undo" onClick={onUndo}>
            Вернуть
          </button>
        </div>
      )}
    </div>
  )
}
