'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import io, { Socket } from 'socket.io-client'
import { asArray } from '@/lib/api-data'

interface Message { _id: string; senderId: { _id: string; name: string; avatar?: string } | string; receiverId: string; content: string; flagged: boolean; createdAt: string; readAt?: string }

const MAX_CHARS = 1000
const WARN_RATE = 5 // per hour

function normalizeSocketMessage(msg: any): Message {
  return {
    ...msg,
    _id: msg._id ?? msg.id,
    senderId: msg.senderId ?? (msg.sender ? { ...msg.sender, _id: msg.sender._id ?? msg.sender.id } : ''),
    receiverId: msg.receiverId ?? msg.receiver?.id ?? '',
  }
}

export default function ClientMessagesPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [practitionerName, setPractitionerName] = useState('Your Therapist')
  const [loading, setLoading] = useState(true)
  const [msgCount, setMsgCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!session?.user.id) return
    // Load assigned practitioner from profile
    fetch('/api/sessions?limit=1').then((r) => r.json()).then((data) => {
      const sessions = asArray<any>(data, 'sessions')
      if (sessions.length > 0) {
        const pract = sessions[0].practitionerId
        if (pract?._id) {
          const cid = [session.user.id, pract._id].sort().join('_')
          setConversationId(cid)
          setReceiverId(pract._id)
          setPractitionerName(pract.name || 'Practitioner')
          fetch(`/api/messages?conversationId=${cid}`).then((r) => r.json()).then((msgs) => {
            setMessages(asArray<Message>(msgs, 'messages'))
            setLoading(false)
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          })
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))
  }, [session?.user.id])

  // Socket.io
  useEffect(() => {
    if (!conversationId || !session?.user.id) return
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, { transports: ['websocket', 'polling'] })
    socketRef.current = socket
    socket.emit('join:conversation', conversationId)
    socket.emit('join:user', session.user.id)
    socket.on('message:received', (msg: Message) => {
      const normalized = normalizeSocketMessage(msg)
      setMessages((prev) => prev.some((item) => item._id === normalized._id) ? prev : [...prev, normalized])
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
    socket.on('typing:start', () => setTyping(true))
    socket.on('typing:stop', () => setTyping(false))
    return () => { socket.disconnect() }
  }, [conversationId, session?.user.id])

  const handleTyping = () => {
    socketRef.current?.emit('typing:start', { conversationId, userId: session?.user.id })
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('typing:stop', { conversationId, userId: session?.user.id })
    }, 1500)
  }

  const handleSend = async () => {
    if (!content.trim() || !receiverId) return
    if (msgCount >= WARN_RATE) {
      toast.warning('You\'ve sent many messages recently. Please slow down.')
    }
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, receiverId, content }),
    })
    if (res.ok) {
      setContent('')
      setMsgCount((c) => c + 1)
    } else {
      toast.error('Failed to send message')
    }
    setSending(false)
  }

  const myId = session?.user.id

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold dark:bg-brand-900/30 dark:text-brand-300">
          {practitionerName[0]}
        </div>
        <div>
          <p className="font-semibold">{practitionerName}</p>
          <p className="text-xs text-muted-foreground">Your practitioner</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-12 animate-pulse">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">MSG</div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start a conversation with {practitionerName}</p>
          </div>
        ) : messages.map((msg) => {
          const isMe = (typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) === myId
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                isMe ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-card border border-border rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {format(new Date(msg.createdAt), 'h:mm a')}
                </p>
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground animate-pulse">
              {practitionerName} is typing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!conversationId ? (
        <div className="card p-4 text-center text-muted-foreground text-sm">
          Book a session first to start messaging your practitioner.
        </div>
      ) : (
        <div className="border-t border-border pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <textarea
                rows={2}
                maxLength={MAX_CHARS}
                className="input-field w-full resize-none pr-16 text-sm"
                placeholder="Type a message… (max 1000 characters)"
                value={content}
                onChange={(e) => { setContent(e.target.value); handleTyping() }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                }}
                id="message-input"
              />
              <span className={`absolute bottom-2 right-2 text-xs ${content.length > 900 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {MAX_CHARS - content.length}
              </span>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !content.trim()}
              className="btn-primary self-end sm:self-auto px-4"
              id="message-send"
            >
              {sending ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
