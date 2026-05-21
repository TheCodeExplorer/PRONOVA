"use client";

import Link from "next/link";
import { ArrowRight, Zap, Users, Shield, Briefcase, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useProjectStore } from "@/lib/store/project-store";
import { useTaskStore } from "@/lib/store/task-store";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user } = useUser();
  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const [mounted, setMounted] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("PRONOVA Personal");

  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem("pronova_workspace_name");
    if (savedName) {
      setWorkspaceName(savedName);
    }
  }, []);

  const activeTasksCount = tasks.filter(t => t.status !== "Completed").length;

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] justify-between bg-transparent transition-colors duration-300">
      {/* Hero Section */}
      <header className="py-12 md:py-16 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 text-sm font-semibold mb-2">
          <Zap className="h-4 w-4" />
          <span>Active Session Verified</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
          Welcome back to PRONOVA, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">
            {user?.firstName || "User"}
          </span>
        </h1>
        
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Your minimalist workspace is ready. You are currently viewing the <strong className="text-indigo-600 dark:text-indigo-400 font-medium">"{workspaceName}"</strong> hub.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-xl px-8 h-14 text-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 border-none shadow-lg text-white shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/tasks">
            <Button size="lg" variant="outline" className="rounded-xl px-8 h-14 text-lg border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-transparent cursor-pointer">
              View My Tasks
            </Button>
          </Link>
        </div>
      </header>

      {/* Live Workspace Overview Cards */}
      <section className="py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Projects</h3>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{projects.length}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total high-level projects initialized in this workspace.</p>
          </div>

          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Tasks</h3>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{activeTasksCount}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Checklist items requiring your immediate attention.</p>
          </div>

          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Workspace Access</h3>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg inline-block">Authorized</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">All collaborative capabilities are unlocked for your profile.</p>
          </div>

        </div>
      </section>

      {/* Trust & Secure Info */}
      <footer className="py-6 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 font-bold text-md text-gray-900 dark:text-white">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-[8px]">
            P
          </div>
          <span>PRONOVA</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <Shield className="h-3 w-3" />
          Secured session powered by Clerk
        </div>
      </footer>
    </div>
  );
}
