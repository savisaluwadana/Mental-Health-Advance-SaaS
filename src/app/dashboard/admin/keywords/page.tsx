'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Keyword { _id: string; keyword: string; category: string; createdAt: string }

export default function AdminKeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const [newWord, setNewWord] = useState('')
  const [newCat, setNewCat] = useState('crisis')

  const fetchKeywords = () => {
    fetch('/api/admin/keywords').then(r => r.json()).then(data => {
      setKeywords(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => { fetchKeywords() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/keywords', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: newWord.toLowerCase().trim(), category: newCat })
    })
    
    if (res.ok) {
      toast.success('Trigger word added to engine')
      setNewWord('')
      fetchKeywords()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Failed to add word')
    }
    setAdding(false)
  }

  const handleDelete = async (id: string, word: string) => {
    if (!confirm(`Remove "${word}" from the crisis safety engine?`)) return
    setDeleting(id)
    const res = await fetch(`/api/admin/keywords?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Trigger word removed')
      fetchKeywords()
    } else {
      toast.error('Failed to remove word')
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Crisis Safety Engine</h1>
        <p className="text-muted-foreground mt-1">Manage dictionary of trigger words that emit automatic priority alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5 border-red-200 dark:border-red-900/50 bg-red-50/10 dark:bg-red-900/10">
            <h2 className="font-semibold text-lg mb-4 text-red-600 dark:text-red-400">Add Trigger Phrase</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label block mt-1">Keyword / Phrase</label>
                <input type="text" className="input-field w-full" placeholder="e.g., hurt myself" value={newWord} onChange={e => setNewWord(e.target.value)} required />
              </div>
              <div>
                <label className="label block mt-1">Category Severity</label>
                <select className="input-field w-full" value={newCat} onChange={e => setNewCat(e.target.value)}>
                  <option value="crisis">Crisis (Suicide / Relapse)</option>
                  <option value="abuse">Abuse / Danger</option>
                  <option value="other">Other High Risk</option>
                </select>
              </div>
              <button disabled={adding || !newWord.trim()} type="submit" className="btn-primary w-full bg-red-600 hover:bg-red-700 text-white border-none">
                {adding ? 'Injecting to Engine...' : 'Add to Safety Engine'}
              </button>
            </form>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground border border-border">
            <h3 className="font-semibold text-foreground mb-2">How it works</h3>
            <p className="mb-2">The system actively scans all incoming messages for exact matches against this dictionary.</p>
            <p>If a match is established, the message is instantly flagged and bypasses notification limits to alert the practitioner immediately on their screen via WebSockets.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold">Active Keywords</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Trigger Phrase</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading engine dictionary...</td></tr>
                  ) : keywords.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">The safety engine currently has no trigger words.</td></tr>
                  ) : keywords.map(k => (
                    <tr key={k._id} className="hover:bg-muted/10">
                      <td className="px-6 py-3">
                        <span className="font-mono bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs">
                          {k.keyword}
                        </span>
                      </td>
                      <td className="px-6 py-3 capitalize">
                        <span className="badge badge-yellow">{k.category}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => handleDelete(k._id, k.keyword)} disabled={deleting === k._id}
                          className="text-xs text-destructive hover:underline">
                          {deleting === k._id ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
