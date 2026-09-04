"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useProjectStore } from "@/lib/store/project-store";
import { useTaskStore } from "@/lib/store/task-store";

export function MigrationProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasRunRef.current) return;

    const migrationStatus = localStorage.getItem("pronova_migrated_to_db");
    if (migrationStatus === "true") {
      return;
    }

    hasRunRef.current = true;

    async function runMigration() {
      try {
        let localProjects = [];
        let localTasks = [];

        try {
          const rawProjectsStr = localStorage.getItem("pronova-projects-storage");
          if (rawProjectsStr) {
            const parsed = JSON.parse(rawProjectsStr);
            localProjects = Array.isArray(parsed?.state?.projects) ? parsed.state.projects : [];
          }
        } catch (e) {
          console.warn("[Migration]: Failed to parse pronova-projects-storage:", e);
        }

        try {
          const rawTasksStr = localStorage.getItem("pronova-personal-tasks-storage");
          if (rawTasksStr) {
            const parsed = JSON.parse(rawTasksStr);
            localTasks = Array.isArray(parsed?.state?.tasks) ? parsed.state.tasks : [];
          }
        } catch (e) {
          console.warn("[Migration]: Failed to parse pronova-personal-tasks-storage:", e);
        }

        // If no local data exists, mark migration as done safely
        if (localProjects.length === 0 && localTasks.length === 0) {
          localStorage.setItem("pronova_migrated_to_db", "true");
          return;
        }

        console.log(
          `[Migration]: Found ${localProjects.length} projects and ${localTasks.length} tasks in localStorage. Migrating to Neon...`
        );

        const res = await fetch("/api/migration/sync-local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projects: localProjects,
            tasks: localTasks,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          console.log("[Migration Success]:", data.summary);
          // ONLY set migration complete flag upon verified server success
          localStorage.setItem("pronova_migrated_to_db", "true");
          // Re-fetch store data so migrated items appear immediately
          fetchProjects();
          fetchTasks();
        } else {
          console.error("[Migration Failed]: Server returned error:", data.error);
        }
      } catch (err) {
        console.error("[Migration Network Error]:", err);
      }
    }

    runMigration();
  }, [isLoaded, isSignedIn, fetchProjects, fetchTasks]);

  return <>{children}</>;
}
