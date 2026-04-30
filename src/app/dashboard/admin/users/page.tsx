'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface User { _id: string; name: string; email: string; role: string; slmcRegNo?: string; verified?: boolean; createdAt: string }

const ROLE_OPTIONS = ['client', 'psychologist', 'psychiatrist', 'counsellor', 'admin']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ role: '', search: '' })
  const [actioning, setActioning] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', role: 'client' })

  const fetchUsers = () => {
    setLoading(true)
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)))
    fetch(`/api/admin/users?${params}`).then(r => r.json()).then(data => {
      setUsers(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers() }, 500)
    return () => clearTimeout(timer)
  }, [filters])

  const toggleVerify = async (id: string, current: boolean) => {
    if (!confirm(`Are you sure you want to ${current ? 'unverify' : 'verify'} this practitioner?`)) return
    setActioning(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: !current })
    })
    
    if (res.ok) {
      toast.success('Practitioner updated successfully')
      fetchUsers()
    } else {
      toast.error('Failed to update')
    }
    setActioning(null)
  }

  const startEdit = (user: User) => {
    setEditingId(user._id)
    setEditForm({ name: user.name, role: user.role })
  }

  const saveEdit = async (id: string) => {
    if (!editForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    setActioning(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editForm.name.trim(), role: editForm.role }),
    })

    if (res.ok) {
      toast.success('User updated successfully')
      setEditingId(null)
      fetchUsers()
    } else {
      toast.error('Failed to update user')
    }
    setActioning(null)
  }

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`CAUTION: Are you sure you want to completely delete user ${email}? This action cannot be reversed.`)) return
    setActioning(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('User deleted')
      fetchUsers()
    } else {
      toast.error('Failed to delete')
    }
    setActioning(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">View, moderate, and manage platform participants</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-center bg-muted/30">
        <input type="text" placeholder="Search by name, email, or SLMC no..." 
          className="input-field w-full sm:max-w-sm flex-1"
          value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <select className="input-field w-full sm:w-auto" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
          <option value="">All Roles</option>
          <option value="client">Clients</option>
          <option value="psychologist">Psychologists</option>
          <option value="psychiatrist">Psychiatrists</option>
          <option value="counsellor">Counsellors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status / Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === u._id ? (
                      <input
                        className="input-field h-9 w-full max-w-xs"
                        value={editForm.name}
                        onChange={(e) => setEditForm((form) => ({ ...form, name: e.target.value }))}
                        aria-label={`Edit name for ${u.email}`}
                      />
                    ) : (
                      <p className="font-semibold">{u.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.slmcRegNo && <p className="text-xs font-mono mt-1 text-brand-600">SLMC: {u.slmcRegNo}</p>}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === u._id ? (
                      <select
                        className="input-field h-9 w-full min-w-36"
                        value={editForm.role}
                        onChange={(e) => setEditForm((form) => ({ ...form, role: e.target.value }))}
                        aria-label={`Edit role for ${u.email}`}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`badge capitalize ${
                        u.role === 'admin' ? 'badge-red' : u.role === 'client' ? 'badge-blue' : 'badge-green'
                      }`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {(u.role === 'psychologist' || u.role === 'psychiatrist') && (
                      <div className="mb-1">
                        {u.verified ? 
                          <span className="badge badge-green text-[10px]">Verified Practioner</span> : 
                          <span className="badge badge-yellow text-[10px]">Pending Verification</span>
                        }
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{format(new Date(u.createdAt), 'MMM d, yyyy')}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {editingId === u._id ? (
                      <>
                        <button onClick={() => saveEdit(u._id)} disabled={actioning === u._id}
                          className="btn-primary text-xs px-2.5 py-1.5 h-auto">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} disabled={actioning === u._id}
                          className="btn-secondary text-xs px-2.5 py-1.5 h-auto">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(u)} disabled={actioning === u._id}
                        className="btn-secondary text-xs px-2.5 py-1.5 h-auto">
                        Edit
                      </button>
                    )}
                    {(u.role === 'psychologist' || u.role === 'psychiatrist' || u.role === 'counsellor') && editingId !== u._id && (
                      <button onClick={() => toggleVerify(u._id, !!u.verified)} disabled={actioning === u._id}
                        className="btn-secondary text-xs px-2.5 py-1.5 h-auto">
                        {u.verified ? 'Revoke' : 'Approve'}
                      </button>
                    )}
                    <button onClick={() => deleteUser(u._id, u.email)} disabled={actioning === u._id}
                      className="btn-ghost text-xs text-destructive hover:bg-destructive/10 px-2.5 py-1.5 h-auto">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
