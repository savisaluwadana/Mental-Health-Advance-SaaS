'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import io, { Socket } from 'socket.io-client'

interface Client { _id: string; name: string }
interface Message { _id: string; senderId: { _id: string; name: string } | string; receiverId: string; content: string; createdAt: string }

export default function PractitionerMessagesPage() {
  const { data: session } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [conversationId, setConversationId] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then(sessions => {
      const uniqueClients = new Map<string, Client>()
      sessions.forEach((s: any) => {
        if (s.clientId && !uniqueClients.has(s.clientId._id)) {
          uniqueClients.set(s.clientId._id, s.clientId)
        }
      })
      setClients(Array.from(uniqueClients.values()))
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedClient || !session?.user.id) return
    const cid = [session.user.id, selectedClient._id].sort().join('_')
    setConversationId(cid)
    
    fetch(`/api/messages?conversationId=${cid}`).then(r => r.json()).then(msgs => {
      setMessages(msgs)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })

    const socket = io(window.location.origin, { transports: ['websocket', 'polling'] })
    socketRef.current = socket
    socket.emit('join:conversation', cid)
    socket.emit('join:user', session.user.id)
    socket.on('message:received', (msg: Message) => {
      setMessages(prev => [...prev, msg])
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
    
    return () => { socket.disconnect() }
  }, [selectedClient, session?.user.id])

  const handleSend = async () => {
    if (!content.trim() || !selectedClient) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, receiverId: selectedClient._id, content })
    })
    if (res.ok) setContent('')
    else toast.error('Failed to send message')
    setSending(false)
  }

  const myId = session?.user.id

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] animate-fade-in">
      <div className="w-72 shrink-0 flex flex-col card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <p className="p-4 text-muted-foreground animate-pulse text-sm">Loading...</p> :
            clients.length === 0 ? <p className="p-4 text-muted-foreground text-sm">No clients yet</p> :
            clients.map(c => (
              <button key={c._id} onClick={() => setSelectedClient(c)}
                className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50 ${selectedClient?._id === c._id ? 'bg-muted' : ''}`}>
                <p className="font-medium">{c.name}</p>
              </button>
            ))
          }
        </div>
      </div>

      <div className="flex-1 card flex flex-col overflow-hidden relative">
        {!selectedClient ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a client to start messaging</div>
        ) : (
          <>
            <div className="p-4 border-b border-border font-semibold flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold dark:bg-brand-900/30 dark:text-brand-300">
                {selectedClient.name[0]}
              </div>
              {selectedClient.name}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[80px]">
              {messages.length === 0 ? <p className="text-center text-muted-foreground py-10">No messages yet. Say hi!</p> :
               messages.map(msg => {
                 const isMe = (typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) === myId
                 return (
                   <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-muted rounded-bl-sm border border-border shadow-sm'}`}>
                       <p className="whitespace-pre-wrap">{msg.content}</p>
                       <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>{format(new Date(msg.createdAt), 'h:mm a')}</p>
                     </div>
                   </div>
                 )
               })
              }
              <div ref={bottomRef} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card flex gap-2">
              <input type="text" className="input-field flex-1 text-sm" placeholder="Type a message..." value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button disabled={!content.trim() || sending} onClick={handleSend} className="btn-primary text-sm px-6">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
