'use client'

import { useState } from 'react'
import { login } from '../lib/api'

const demoAccounts = [
  ['Client', 'client@mindbridge.lk'],
  ['Psychologist', 'psychologist@mindbridge.lk'],
  ['Psychiatrist', 'psychiatrist@mindbridge.lk'],
  ['Admin', 'admin@mindbridge.lk'],
] as const

export function AuthPanel() {
  const [email, setEmail] = useState('client@mindbridge.lk')
  const [password, setPassword] = useState('MindBridge123!')
  const [status, setStatus] = useState('')

  async function handleLogin() {
    setStatus('Signing in...')
    try {
      const result = await login(email, password)
      localStorage.setItem('mindbridge_token', result.accessToken)
      localStorage.setItem('mindbridge_user', JSON.stringify(result.user))
      setStatus(`Signed in as ${result.user.name}. Open the dashboard below.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  return (
    <div className="panel p-6">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-reef">Demo Access</p>
      <h2 className="mt-3 font-display text-3xl font-black text-lagoon">Step into the care console</h2>
      <div className="mt-6 grid gap-3">
        <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="button-primary" onClick={handleLogin}>
          Sign in
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {demoAccounts.map(([label, demoEmail]) => (
          <button key={demoEmail} className="badge" onClick={() => setEmail(demoEmail)}>
            {label}
          </button>
        ))}
      </div>
      {status ? <p className="mt-4 text-sm font-semibold text-lagoon">{status}</p> : null}
      <a className="button-soft mt-5 w-full" href="/dashboard">
        Open Dashboard
      </a>
    </div>
  )
}
