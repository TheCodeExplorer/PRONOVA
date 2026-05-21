import Link from "next/link";
import { ArrowRight, CheckCircle2, Layout, Zap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <header className="px-6 py-12 md:py-24 text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-4">
          <Zap className="h-4 w-4" />
          <span>Now in early access</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
          Project management, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">
            simplified for clarity.
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          A minimal, intuitive tool built for teams who value speed and focus. 
          Manage projects, track tasks, and collaborate effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-xl px-8 h-14 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="ghost" className="rounded-xl px-8 h-14 text-lg text-gray-600">
            View Demo
          </Button>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="px-6 py-20 bg-gray-50/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layout className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Intuitive Dashboard</h3>
            <p className="text-gray-500">Get a bird's-eye view of your entire workspace in a single, clean interface.</p>
          </div>
          <div className="space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Team Collaboration</h3>
            <p className="text-gray-500">Invite members, assign roles, and track contributions without the clutter.</p>
          </div>
          <div className="space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Task Precision</h3>
            <p className="text-gray-500">Focus on what matters most with simplified task tracking and status updates.</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <footer className="mt-auto py-12 px-6 border-t border-gray-100 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs">
            P
          </div>
          <span>PRONOVA</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Shield className="h-4 w-4" />
          Secured by Clerk
        </div>
        <p className="text-sm text-gray-400">© 2026 PRONOVA. All rights reserved.</p>
      </footer>
    </div>
  );
}
