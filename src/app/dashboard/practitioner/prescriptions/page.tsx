'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { format, addMonths } from 'date-fns'

interface Medication { name: string; dosage: string; frequency: string; duration: string }
interface Prescription { _id: string; clientId: { name: string; email: string }; issuedAt: string; expiresAt: string; status: string; medications: Medication[] }
interface Client { _id: string; name: string; email: string }

export default function PrescriptionsPage() {
  const { data: session } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'new'>('list')
  const [downloading, setDownloading] = useState<string | null>(null)

  // New prescription form
  const [form, setForm] = useState({
    clientId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }] as Medication[],
    expiresAt: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
  })
  const [signatureDataUrl, setSignatureDataUrl] = useState('')
  const [sealDataUrl, setSealDataUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Only psychiatrists can access
    if (session?.user.role !== 'psychiatrist') return

    // Fetch existing sealDataUrl from user profile
    fetch(`/api/users/${session.user.id}`).then((r) => r.json()).then((user) => {
      if (user.sealDataUrl) setSealDataUrl(user.sealDataUrl)
    })

    // Fetch prescriptions and clients (from sessions)
    Promise.all([
      fetch('/api/prescriptions').then((r) => r.json()),
      fetch('/api/sessions').then((r) => r.json()),
    ]).then(([presc, sess]) => {
      setPrescriptions(presc)
      // Extract unique clients from sessions
      const uniqueClients: Record<string, Client> = {}
      sess.forEach((s: any) => {
        if (s.clientId?._id) uniqueClients[s.clientId._id] = s.clientId
      })
      setClients(Object.values(uniqueClients))
      setLoading(false)
    })
  }, [session])

  // Canvas drawing
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setDrawing(true)
    setLastPos(getPos(e))
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#0d937c'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    setLastPos(pos)
  }

  const stopDraw = () => {
    setDrawing(false)
    const canvas = canvasRef.current!
    setSignatureDataUrl(canvas.toDataURL('image/png'))
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureDataUrl('')
  }

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSealDataUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const addMedication = () => setForm((f) => ({ ...f, medications: [...f.medications, { name: '', dosage: '', frequency: '', duration: '' }] }))
  const removeMedication = (i: number) => setForm((f) => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }))
  const updateMed = (i: number, field: keyof Medication, value: string) => {
    setForm((f) => {
      const meds = [...f.medications]
      meds[i] = { ...meds[i], [field]: value }
      return { ...f, medications: meds }
    })
  }

  const handleSubmit = async () => {
    if (!form.clientId) { toast.error('Select a client'); return }
    if (!signatureDataUrl) { toast.error('Please draw your signature'); return }
    if (!sealDataUrl) { toast.error('Please upload your seal'); return }
    if (form.medications.some((m) => !m.name || !m.dosage)) { toast.error('Fill in all medication fields'); return }

    setSubmitting(true)
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, signatureDataUrl, sealDataUrl, expiresAt: new Date(form.expiresAt).toISOString() }),
    })
    if (res.ok) {
      toast.success('Prescription created!')
      const newPresc = await res.json()
      setPrescriptions((prev) => [newPresc, ...prev])
      setView('list')
    } else {
      const err = await res.json(); toast.error(err.error || 'Failed to create prescription')
    }
    setSubmitting(false)
  }

  const downloadPdf = async (id: string) => {
    setDownloading(id)
    const res = await fetch(`/api/prescriptions/${id}/pdf`)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `prescription-${id.slice(-8)}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded')
    } else {
      toast.error('Failed to generate PDF')
    }
    setDownloading(null)
  }

  if (session?.user.role !== 'psychiatrist') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-semibold">Access Restricted</p>
          <p className="text-muted-foreground text-sm mt-1">Prescription module is for psychiatrists only</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">Issue digital prescriptions with SLMC registration</p>
        </div>
        <button onClick={() => setView(view === 'list' ? 'new' : 'list')}
          className={view === 'new' ? 'btn-secondary' : 'btn-primary'} id="new-prescription-btn">
          {view === 'new' ? '← Back to List' : '+ New Prescription'}
        </button>
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-24" />) :
            prescriptions.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-3">💊</p>
                <p className="font-semibold">No prescriptions yet</p>
                <p className="text-sm text-muted-foreground">Issue your first prescription using the button above</p>
              </div>
            ) : prescriptions.map((p) => (
              <div key={p._id} className="card p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{p.clientId?.name ?? 'Client'}</p>
                    <span className={`badge text-xs ${p.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {p.medications.length} medication{p.medications.length > 1 ? 's' : ''} ·{' '}
                    Issued {format(new Date(p.issuedAt), 'd MMM yyyy')} ·{' '}
                    Expires {format(new Date(p.expiresAt), 'd MMM yyyy')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.medications.slice(0, 3).map((m, i) => (
                      <span key={i} className="badge badge-blue text-xs">{m.name} {m.dosage}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => downloadPdf(p._id)} disabled={downloading === p._id}
                  className="btn-primary text-sm shrink-0" id={`download-pdf-${p._id}`}>
                  {downloading === p._id ? 'Generating…' : '⬇ PDF'}
                </button>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Client selection */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold">Patient & Validity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-1.5">Patient</label>
                <select className="input-field w-full" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} id="prescription-client">
                  <option value="">Select patient</option>
                  {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">Valid Until</label>
                <input type="date" className="input-field w-full" value={form.expiresAt}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Medications</h2>
              <button onClick={addMedication} className="btn-secondary text-sm">+ Add Medication</button>
            </div>
            {form.medications.map((med, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-border">
                <div>
                  <label className="label text-xs block mb-1">Medication</label>
                  <input className="input-field w-full text-sm" placeholder="e.g. Sertraline" value={med.name}
                    onChange={(e) => updateMed(i, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs block mb-1">Dosage</label>
                  <input className="input-field w-full text-sm" placeholder="e.g. 50mg" value={med.dosage}
                    onChange={(e) => updateMed(i, 'dosage', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs block mb-1">Frequency</label>
                  <input className="input-field w-full text-sm" placeholder="e.g. Once daily" value={med.frequency}
                    onChange={(e) => updateMed(i, 'frequency', e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="label text-xs block mb-1">Duration</label>
                    <input className="input-field w-full text-sm" placeholder="e.g. 30 days" value={med.duration}
                      onChange={(e) => updateMed(i, 'duration', e.target.value)} />
                  </div>
                  {form.medications.length > 1 && (
                    <button onClick={() => removeMedication(i)}
                      className="self-end btn-ghost text-destructive hover:bg-destructive/10 px-2 py-2 text-sm">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Signature */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold">Digital Signature</h2>
            <p className="text-xs text-muted-foreground">Draw your signature below. It will be embedded in the PDF.</p>
            <div className="rounded-xl border-2 border-dashed border-brand-300 bg-white dark:bg-card overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={120}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                id="signature-canvas"
              />
            </div>
            <div className="flex items-center justify-between">
              <button onClick={clearCanvas} className="btn-ghost text-sm">Clear Signature</button>
              {signatureDataUrl && <span className="text-xs text-brand-600">✓ Signature captured</span>}
            </div>
          </div>

          {/* Seal */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold">Official Seal</h2>
            <p className="text-xs text-muted-foreground">
              {sealDataUrl ? 'Your seal is saved from previous uploads. You can upload a new one.' : 'Upload your official seal (PNG/JPG). It will be stored securely and reused.'}
            </p>
            {sealDataUrl && (
              <img src={sealDataUrl} alt="Seal preview" className="h-20 w-20 rounded-lg border border-border object-contain bg-white p-1" />
            )}
            <input type="file" accept="image/*" onChange={handleSealUpload} className="text-sm" id="seal-upload" />
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-3" id="prescription-submit">
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Prescription…
              </span>
            ) : '💊 Create Prescription & Save'}
          </button>
        </div>
      )}
    </div>
  )
}
