import { spawn } from 'node:child_process'
import net from 'node:net'

const rootDir = new URL('..', import.meta.url).pathname
const apiPort = Number(process.env.API_PORT ?? process.env.PORT ?? 4000)
const webPort = Number(process.env.WEB_PORT ?? 3000)

const services = [
  {
    name: 'API',
    command: 'npm',
    args: ['run', 'dev', '--workspace', '@mindbridge/api'],
    port: apiPort,
    portEnvName: 'API_PORT',
    env: { ...process.env, PORT: String(apiPort) },
  },
  {
    name: 'Web',
    command: 'npm',
    args: ['run', 'dev', '--workspace', '@mindbridge/web'],
    port: webPort,
    portEnvName: 'WEB_PORT',
    env: { ...process.env, PORT: String(webPort) },
  },
]

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port)
  })
}

let shuttingDown = false
let exitCode = 0
let children = []

function stopChildren(signal) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  setTimeout(() => process.exit(exitCode), 2000).unref()
}

process.on('SIGINT', () => stopChildren('SIGINT'))
process.on('SIGTERM', () => stopChildren('SIGTERM'))

for (const service of services) {
  if (!(await canListen(service.port))) {
    console.error(
      `[SafeSpace Lanka] Port ${service.port} is already in use. Stop the existing ${service.name} server or set ${service.portEnvName} to another port.`,
    )
    process.exit(1)
  }
}

children = services.map((service) => {
  const child = spawn(service.command, service.args, {
    cwd: rootDir,
    env: service.env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  child.on('error', (error) => {
    if (!shuttingDown) {
      exitCode = 1
      console.error(`[SafeSpace Lanka] Failed to start ${service.name}: ${error.message}`)
      stopChildren('SIGTERM')
    }
  })

  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      exitCode = code ?? (signal ? 0 : 1)
      console.error(`[SafeSpace Lanka] ${service.name} dev server stopped. Closing the remaining process.`)
      stopChildren('SIGTERM')
    }
  })

  return child
})
