# 🧠 PRONOVA | Professional Architectural & System Overview

This document provides a comprehensive technical overview of the **PRONOVA** project architecture, its component layout, state management workflows, authentication layer, and database interactions.

---

## 🗺️ 1. High-Level Architecture & Data Flow

PRONOVA balances ultra-responsive client-side state persistence with robust serverless backend integrations. 

```
                                  +-----------------------------+
                                  |         Client UI           |
                                  |     (React 19 / Next.js)     |
                                  +--------------+--------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                                                           |
     +-------------v-------------+                               +-------------v-------------+
     |   State Management (Client) |                               |     Serverless Backend    |
     |   Zustand 5.0 (Persistent)  |                               |    Next.js API Gateway    |
     +-------------+-------------+                               +-------------+-------------+
                   |                                                           |
     +-------------v-------------+                               +-------------v-------------+
     |     Browser LocalStorage  |                               |    Transactional Emails   |
     |    (Instant UI Syncing)   |                               |      (SMTP / Resend)      |
     +---------------------------+                               +---------------------------+
                                                                               |
                                                                 +-------------v-------------+
                                                                 |     Database Connection   |
                                                                 |     Prisma ORM Client     |
                                                                 +-------------+-------------+
                                                                               |
                                                                 +-------------v-------------+
                                                                 |     Neon PostgreSQL DB    |
                                                                 |    (Serverless Cloud DB)  |
                                                                 +---------------------------+
```

---

## 💻 2. The Frontend Layer

* **UI Framework**: Built on **React 19** and the **Next.js 16 (App Router)** framework, providing optimal server-side pre-rendering and routing.
* **Styling**: Utilizes **Tailwind CSS 4** for high-efficiency styling. Custom **HSL Color System tokens** are defined in the global CSS files to support responsive light and dark themes.
* **Component Design**: Incorporates Radix UI primitives (`@base-ui/react` and `shadcn`) to deliver accessible components, such as dropdown menus, dialog modals, and animated cards.

---

## 💾 3. Client State & persistence (Zustand)

Instead of making slow, synchronous network calls for every checkbox click or task creation, PRONOVA manages user state entirely on the client, synchronizing data instantly to provide a highly interactive experience:

* **Zustand Stores**: Configured in `src/lib/store/` as isolated stores (e.g. `task-store.ts`, `project-store.ts`, `reminder-store.ts`).
* **Persistence**: Every store uses Zustand's `persist` middleware, automatically syncing state changes to the browser's `localStorage`.
* **SSR Hydration Guarding**: To prevent Server-Side Rendering (SSR) hydration mismatches—which happen because `localStorage` is unavailable on the initial server-side compile—components utilize a double-rendering mount safeguard:
  ```typescript
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  ```
  This ensures that stateful indicators (like the task badge) only render once the client-side session is safely initialized.

---

## 🔐 4. Authentication Layer (Clerk)

* **Authentication Gateway**: All user accounts, user profiles, and session registrations are securely handled by **Clerk Next.js**.
* **Middleware Shield**: `src/middleware.ts` runs on the edge network. It intercept requests and ensures that all routes (except public sign-in/sign-up components) are protected:
  ```typescript
  export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  });
  ```
* **Session Metadata**: Provides real-time name, profile picture, and permission state using the hook `useUser()`.

---

## 🛢️ 5. Relational Database Layer (Prisma & Neon PostgreSQL)

When syncing data to the cloud, the application uses a structured relational database model designed to handle collaborative workspace flows:

* **Database Engine**: Hosted on **Neon Serverless PostgreSQL** for automatic scalability and connection pooling.
* **ORM**: Managed via **Prisma ORM**.
* **Database Models (`prisma/schema.prisma`)**:
  * `Workspace`: Holds unique naming, slugs, and lists of members.
  * `Member`: Connects a Clerk `userId` to a specific `Workspace` with roles (`ADMIN` or `MEMBER`).
  * `Project`: Belongs to a `Workspace` and holds end dates, statuses, and checklists.
  * `Task`: A relational task entry linked directly to a `Project` and optionally assigned to a `Member`.

---

## ✉️ 6. API Route & Email Operations

* **Serverless Backend routes**: Hosted under `src/app/api/team/invite/route.ts` to execute server-side Node.js logic safely.
* **Origin Detection**: Resolves incoming domains dynamically using header parameters:
  ```typescript
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  ```
* **Email Dispatch Strategy**:
  1. Checks for user-defined **SMTP environment credentials** (e.g. Gmail SMTP) to dispatch real emails directly.
  2. Falls back to **Resend API** for domain-verified transactional emails.
  3. Falls back to a mock console logger if no credentials exist to maintain local developer testing environments.

---

## 🌟 Key Talking Points for Demos & Portfolios

1. **Persisted Performance**: *"I structured the client state around Zustand stores with persistent browser caching, ensuring that all UI operations (adding, updating, and completing tasks) take place instantly without network lag."*
2. **Hydration Safeguarding**: *"To protect the Next.js SSR pipeline from client-only cache mismatches, I implemented React lifecycle guards that delay state-bound UI rendering until the client mounts successfully."*
3. **CI/CD Integration**: *"The build step is optimized with Prisma generators running inside the Vercel compiler pipeline, ensuring zero compilation failures during continuous integration."*
