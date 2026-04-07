# 6. Role-Based Access Control (RBAC)

The platform employs a strict 3-tier Role-Based Access Control system (with a hidden `admin` tier reserved for system maintenance). Every feature, API route, and UI element relies on the NextAuth JWT to enforce authorization.

## The Roles

### `client`
- **Dashboard:** `/dashboard/client`
- Primary consumer of the platform.
- Can book sessions, track mood, set goals, and message assigned practitioners.
- Cannot see internal clinical notes.

### `psychologist`
- **Dashboard:** `/dashboard/practitioner`
- First-tier clinical provider.
- Can view assigned clients, message them (and receive safety alerts), and write private `SessionNote` documents.
- Blocked programmatically from issuing prescriptions (by `middleware.ts` and `route.ts` API protections).

### `psychiatrist`
- **Dashboard:** `/dashboard/practitioner` (Includes the exclusive Prescription module)
- Second-tier clinical provider.
- Inherits all `psychologist` permissions.
- **Can generate and digitally sign legal prescriptions** due to valid SLMC validation.

## Security Enforcement points

1. **`middleware.ts`**: The edge runtime intercepts all incoming HTTP requests. If a `client` attempts to navigate to `/dashboard/practitioner`, the middleware immediately redirects them to `/dashboard/client`.
2. **API Routes (`route.ts`)**: Every secure API route calls `getServerSession()` first. If a `psychologist` attempts a `POST` request to `/api/prescriptions`, the route returns `403 Forbidden`.
3. **UI Element Hiding**: Components like the Dashboard Sidebar read the session object. If the role is not `psychiatrist`, the "Prescriptions" tab is simply never rendered in the DOM.
