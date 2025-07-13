export function addTimeToDate(timeString: string, date?: Date): Date {
  const regex = /^(\d+)([mhd])$/
  const match = timeString.match(regex)

  if (!match) {
    throw new Error('Invalid format. Use format like "15m", "1h", "1d"')
  }

  const amount = parseInt(match[1], 10)
  const unit = match[2]
  const now = date ?? new Date()

  switch (unit) {
    case 'm':
      return new Date(now.getTime() + amount * 60 * 1000)
    case 'h':
      return new Date(now.getTime() + amount * 60 * 60 * 1000)
    case 'd':
      return new Date(now.getTime() + amount * 24 * 60 * 60 * 1000)
    default:
      throw new Error('Unsupported time unit. Use m, h or d')
  }
}
