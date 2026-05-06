'use client'

import { useState } from 'react'
import { register } from '../lib/api'

export function RegisterForm() {
  const [status, setStatus] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setStatus('Creating account...')
    try {
      const result = await register({
        name: String(data.get('name')),
        email: String(data.get('email')),
        password: String(data.get('password')),
        role: String(data.get('role')),
        province: String(data.get('province')),
        languages: ['Sinhala', 'English'],
      })
      localStorage.setItem('mindbridge_token', result.accessToken)
      localStorage.setItem('mindbridge_user', JSON.stringify(result.user))
      setStatus(`Created account for ${result.user.name}.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to register.')
    }
  }

  return (
    <form className="panel mx-auto max-w-2xl p-6" onSubmit={handleSubmit}>
      <h1 className="font-display text-4xl font-black text-lagoon">Create your MindBridge account</h1>
      <div className="mt-6 grid gap-4">
        <input className="input" name="name" placeholder="Full name" required />
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="password" type="password" placeholder="Password" defaultValue="MindBridge123!" required />
        <select className="input" name="role" defaultValue="client">
          <option value="client">Client</option>
          <option value="psychologist">Psychologist</option>
          <option value="psychiatrist">Psychiatrist</option>
          <option value="counsellor">Counsellor</option>
        </select>
        <input className="input" name="province" placeholder="Province" defaultValue="Western" />
        <button className="button-primary">Register</button>
      </div>
      {status ? <p className="mt-4 text-sm font-bold text-lagoon">{status}</p> : null}
    </form>
  )
}
