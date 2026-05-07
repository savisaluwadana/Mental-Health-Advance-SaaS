'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { asArray } from '@/lib/api-data'

interface Article {
  _id: string
  title: string
  category: string
  desc: string
  content?: string
  readTime: string
  marker: string
}

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', category: '', desc: '', readTime: '', marker: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles')
      if (res.ok) {
        const data = await res.json()
        setArticles(asArray<Article>(data, 'articles'))
      }
    } catch (e) {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const url = editingId ? `/api/articles/${editingId}` : '/api/articles'
    const method = editingId ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success(editingId ? 'Article updated' : 'Article created')
        setForm({ title: '', category: '', desc: '', readTime: '', marker: '' })
        setEditingId(null)
        fetchArticles()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save article')
      }
    } catch (e) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (article: Article) => {
    setEditingId(article._id)
    setForm({
      title: article.title,
      category: article.category,
      desc: article.desc,
      readTime: article.readTime,
      marker: article.marker
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Article deleted')
        fetchArticles()
      } else {
        toast.error('Failed to delete article')
      }
    } catch (e) {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <p className="text-muted-foreground">Add, edit, or remove articles from the resources page.</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Article' : 'Add New Article'}</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input required type="text" className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <input required type="text" className="input-field" placeholder="e.g. Anxiety" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label className="label">Read Time</label>
            <input required type="text" className="input-field" placeholder="e.g. 5 min read" value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })} />
          </div>
          <div>
            <label className="label">Marker (2 chars)</label>
            <input required type="text" maxLength={2} className="input-field" placeholder="e.g. AN" value={form.marker} onChange={e => setForm({ ...form, marker: e.target.value.toUpperCase() })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea required className="input-field min-h-[80px]" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm({ title: '', category: '', desc: '', readTime: '', marker: '' }) }}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update Article' : 'Add Article'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Published Articles</h2>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <p className="p-6 text-center text-muted-foreground animate-pulse">Loading articles...</p>
          ) : articles.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">No articles published yet.</p>
          ) : (
            articles.map(article => (
              <div key={article._id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-green text-xs">{article.category}</span>
                    <span className="text-xs font-medium bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">{article.marker}</span>
                  </div>
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.desc}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleEdit(article)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Edit</button>
                  <button onClick={() => handleDelete(article._id)} className="text-sm font-medium text-destructive hover:text-red-700">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
