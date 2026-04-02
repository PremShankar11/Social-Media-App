export function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return 'Now'
  }

  const diffInMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))

  if (diffInMinutes < 1) {
    return 'Now'
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}
