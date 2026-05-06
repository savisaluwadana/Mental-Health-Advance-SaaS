export interface ScanResult {
  flagged: boolean
  reasons: string[]
}

const fallbackKeywords = ['suicide', 'self harm', 'hurt myself', 'kill myself', 'relapse']

export async function scanMessage(content: string): Promise<ScanResult> {
  const lower = content.toLowerCase()
  const reasons = fallbackKeywords.filter((keyword) => lower.includes(keyword))
  return { flagged: reasons.length > 0, reasons }
}
