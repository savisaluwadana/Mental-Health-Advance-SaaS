const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
  })

  // Expose io globally so API routes can emit events
  globalThis.io = io

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`)

    socket.on('join:conversation', (conversationId) => {
      socket.join(conversationId)
    })

    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`)
    })

    socket.on('typing:start', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('typing:start', { userId })
    })

    socket.on('typing:stop', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('typing:stop', { userId })
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`)
    })
  })

  httpServer.listen(port, () => {
    console.log(`\n🧠 MindBridge SL running at http://${hostname}:${port}\n`)
  })
})
