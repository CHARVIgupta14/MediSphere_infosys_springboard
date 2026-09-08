import './ErrorMessage.css'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box">
      <p className="error-text">⚠ {message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
