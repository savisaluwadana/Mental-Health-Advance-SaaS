export function asArray<T>(data: unknown, key?: string): T[] {
  if (Array.isArray(data)) {
    return data
  }

  if (key && data && typeof data === 'object') {
    const value = (data as Record<string, unknown>)[key]
    if (Array.isArray(value)) {
      return value as T[]
    }
  }

  return []
}

export function asItem<T>(data: unknown, key?: string): T | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  if (key) {
    const value = (data as Record<string, unknown>)[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as T
    }
  }

  if (!Array.isArray(data) && !('error' in data)) {
    return data as T
  }

  return null
}
