# PRONOVA | Minimalist Project & Task Management

PRONOVA is a high-performance, minimalist project and task management platform built on Next.js 16 and React 19. It provides an intuitive workspace for teams to collaborate, track task checklists, monitor deadlines, and stay organized.

🚀 **Live Deployment**: [project-management-gules-mu.vercel.app](https://project-management-gules-mu.vercel.app)

---

## ✨ Features

- **Dynamic Workspace Dashboard**: Get real-time stats on active projects, pending checklists, and team status.
- **Smart Task Management**: Add, update, prioritize, and delete tasks. The sidebar dynamic workload badge auto-updates and hides when caught up.
- **Interactive Reminders**: Live notifications and customizable popovers for upcoming deadlines.
- **Role-Based Collaboration**: Secure team member invitations via dynamic email setups (Nodemailer & Resend).
- **Aesthetic Dark Mode**: Seamless, system-matching light and dark modes powered by Tailwind CSS 4.

---

## 🛠️ Technical Stack

- **Frontend Framework**: Next.js 16.2 (App Router & Turbopack)
- **Library**: React 19
- **State Management**: Zustand 5.0 (with local persistence)
- **Authentication**: Clerk Next.js 7.2
- **Database ORM**: Prisma 7.8
- **Database**: Neon Serverless (PostgreSQL)
- **Styling**: Tailwind CSS 4 & Radix Primitives

---

## 💻 Local Development

Follow these steps to run the application locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/TheCodeExplorer/Project-Management.git
cd Project-Management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory and configure the following keys:
```env
DATABASE_URL="your-postgresql-connection-string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
```

### 4. Sync Database Schema
```bash
npx prisma db push
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see your local instance.

---

## 📦 Production Deployment

This project is configured for one-click continuous deployment on **Vercel**:
- Every push to the `main` branch automatically builds and deploys your changes.
- Build command automatically generates Prisma typings: `npx prisma generate && next build`.
