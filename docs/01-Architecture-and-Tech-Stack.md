# 1. Architecture & Tech Stack

SafeSpace Lanka is a full-stack mental health platform designed specifically for the Sri Lankan context, serving all 9 provinces in 3 languages (Sinhala, Tamil, English).

## Core Technologies
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom UI components
- **Database:** MongoDB (via Mongoose ORM)
- **Authentication:** NextAuth.js (Session JWTs)
- **Real-time:** Socket.io (custom Node.js server wrapper)
- **PDF Generation:** `@react-pdf/renderer` (Server-side rendering)

## System Design
The platform architecture prioritizes **real-time responsiveness** and **data privacy**. 

Because Next.js API routes are fundamentally stateless and designed for traditional Request/Response cycles, we utilize a **custom `server.js` wrapper**. This custom server binds a Socket.io instance to the underlying Node.js HTTP server. 
This allows `localhost:3000` to simultaneously serve standard Next.js server-rendered pages and maintain persistent WebSocket connections for live chat and safety alerts.

## Client-Server Data Flow
1. **Static Pages:** Rendered on the server at request time (SSR) or build time (SSG), like the public directory.
2. **Dashboard Data:** Fetched client-side or during server-side rendering, heavily utilizing NextAuth for JWT validation to ensure users only access their assigned roles (`client`, `psychologist`, `psychiatrist`).
3. **Chat & Alerts:** Driven entirely over WebSockets. Once a user logs in, the `SessionProvider.tsx` connects them to the socket server, joining a specific room based on their `userId`.

## Deployment Requirements
Because of the stateful `server.js` requirement for WebSockets, the platform **cannot** be deployed to Serverless-only environments like Vercel or Netlify. It requires a long-running instance (Docker container, VPS, Render Web Service, Railway, AWS EC2/ECS).
