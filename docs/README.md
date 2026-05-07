# SafeSpace Lanka Developer Documentation

Welcome to the internal technical documentation for **SafeSpace Lanka**.

This directory contains detailed explanations of every core architectural concept, platform feature, and security mechanism deployed in Version 1.

## Documentation Index

**1. [Architecture & Tech Stack](./01-Architecture-and-Tech-Stack.md)**
Explanation of the Custom Node.js server wrapper, the Next.js 14 App Router integration, and deployment requirements.

**2. [Database Schema](./02-Database-Schema.md)**
An overview of the strictly normalized MongoDB/Mongoose models separating authentication from protected health information.

**3. [Real-Time Socket Messaging](./03-Realtime-Socket-Messaging.md)**
Details on the Socket.io implementation handling live cross-platform chat and instant typing indicators.

**4. [Keyword Safety Engine](./04-Keyword-Safety-Engine.md)**
Deep dive into the regex-based triage system that intercepts severe mental health crises and pushes live alerts to practitioners.

**5. [Prescription Module](./05-Prescription-Module.md)**
Documentation on the zero-persistence, HIPAA-compliant PDF generation pipeline for psychiatrists.

**6. [Role-Based Access Control](./06-Role-Based-Access-Control.md)**
Analysis of the permissions matrix (`client`, `psychologist`, `psychiatrist`) enforced globally via NextAuth.js JWTs and Edge Middleware.
