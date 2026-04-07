/**
 * Keyword Alert Engine
 * Scans message content for flagged keywords and patterns.
 * Called server-side when a message is saved (in Socket.io handler).
 */

import connectDB from '@/lib/mongodb'
import KeywordAlertModel from '@/models/KeywordAlert'

interface ScanResult {
  flagged: boolean
  reasons: string[]
}

// In-memory cache for keyword list (refreshed every 5 minutes)
let keywordCache: { keyword: string; category: string }[] = []
let cacheExpiry = 0

async function loadKeywords() {
  const now = Date.now()
  if (now < cacheExpiry && keywordCache.length > 0) return keywordCache

  await connectDB()
  keywordCache = await KeywordAlertModel.find({}).lean().then((docs) =>
    docs.map((d) => ({ keyword: d.keyword, category: d.category }))
  )
  cacheExpiry = now + 5 * 60 * 1000 // 5 minutes
  return keywordCache
}

// Rate-limiting tracker: { senderId -> timestamp[] }
const messageTimestamps = new Map<string, number[]>()

export function checkRateLimit(senderId: string): { exceeded: boolean; count: number } {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const times = (messageTimestamps.get(senderId) || []).filter((t) => now - t < oneHour)
  times.push(now)
  messageTimestamps.set(senderId, times)
  return { exceeded: times.length > 5, count: times.length }
}

// Notification throttle: { practitionerId+clientId -> timestamp[] }
const notificationTracker = new Map<string, number[]>()

export function checkNotificationThrottle(practitionerId: string, clientId: string): boolean {
  const key = `${practitionerId}:${clientId}`
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const times = (notificationTracker.get(key) || []).filter((t) => now - t < oneHour)

  if (times.length >= 3) return false // exceeded throttle
  times.push(now)
  notificationTracker.set(key, times)
  return true // ok to notify
}

export async function scanMessage(content: string, senderId: string): Promise<ScanResult> {
  const reasons: string[] = []
  const lower = content.toLowerCase()

  // Load keywords from DB/cache
  const keywords = await loadKeywords()

  for (const { keyword, category } of keywords) {
    // Support wildcard suffix (e.g., suicid*)
    const pattern = keyword.endsWith('*')
      ? new RegExp(`\\b${keyword.slice(0, -1)}\\w*`, 'i')
      : new RegExp(`\\b${keyword}\\b`, 'i')

    if (pattern.test(lower)) {
      reasons.push(`[${category}] matched keyword: "${keyword}"`)
    }
  }

  // Default crisis keywords if DB is empty
  const defaultCrisis = ['suicid', 'kill myself', 'hurt myself', "can't go on", 'end it all']
  for (const kw of defaultCrisis) {
    if (lower.includes(kw) && !reasons.some((r) => r.includes(kw))) {
      reasons.push(`[crisis] default keyword: "${kw}"`)
    }
  }

  // Financial keywords
  const finKeywords = ['pay me', 'refund', 'lend me', 'send money', 'bank transfer']
  for (const kw of finKeywords) {
    if (lower.includes(kw)) {
      reasons.push(`[financial] matched keyword: "${kw}"`)
    }
  }

  // Rate limiting pattern (obsessive messaging) — handled via checkRateLimit above
  const { exceeded, count } = checkRateLimit(senderId)
  if (exceeded) {
    reasons.push(`[pattern] obsessive messaging: ${count} messages in the last hour`)
  }

  return { flagged: reasons.length > 0, reasons }
}
