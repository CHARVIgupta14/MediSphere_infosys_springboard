import './LoadingState.css'

export function SkeletonBlock({ height = 16, width = '100%' }) {
  return <div className="skeleton-block" style={{ height, width }} />
}

export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <SkeletonBlock height={38} width={38} />
      <div className="skeleton-card-lines">
        <SkeletonBlock height={13} width="60%" />
        <SkeletonBlock height={11} width="40%" />
        <SkeletonBlock height={11} width="45%" />
      </div>
    </div>
  )
}

export default function LoadingState({ text = 'Loading...', variant = 'spinner', count = 4 }) {
  if (variant === 'cards') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    )
  }

  return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p>{text}</p>
    </div>
  )
}
