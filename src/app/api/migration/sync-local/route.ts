import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateActiveWorkspace } from "@/lib/workspace-helper";
import {
  toPrismaProjectStatus,
  toPrismaPriority,
  toPrismaTaskStatus,
} from "@/lib/project-task-helper";

interface RawChecklistTask {
  id?: string;
  title: string;
  status?: string;
}

interface RawProject {
  id?: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  tasks?: RawChecklistTask[];
  createdAt?: number | string;
}

interface RawPersonalTask {
  id?: string;
  title: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
  createdAt?: number | string;
}

/**
 * POST /api/migration/sync-local
 * Safe, idempotent, workspace-scoped migration endpoint for browser localStorage data.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    // Always resolve workspace server-side; NEVER trust a client-supplied workspaceId
    const { workspace } = await getOrCreateActiveWorkspace(userId);

    const body = await request.json();
    const rawProjects: RawProject[] = Array.isArray(body?.projects) ? body.projects : [];
    const rawTasks: RawPersonalTask[] = Array.isArray(body?.tasks) ? body.tasks : [];

    let projectsCreated = 0;
    let projectsSkipped = 0;
    let tasksCreated = 0;
    let tasksSkipped = 0;

    // Track old local project IDs to new/existing Neon project IDs
    const projectIdMap: Record<string, string> = {};

    // ----------------------------------------------------
    // STEP 1: Migrate Projects & Embedded Checklist Tasks
    // ----------------------------------------------------
    for (const rawProj of rawProjects) {
      if (!rawProj.name || typeof rawProj.name !== "string" || !rawProj.name.trim()) {
        continue;
      }

      const trimmedName = rawProj.name.trim();

      // Check if project already exists in this workspace by ID or by exact Name
      let targetProject = null;
      if (rawProj.id) {
        targetProject = await prisma.project.findUnique({
          where: { id: rawProj.id },
        });
        // If found but belongs to another workspace, do not claim it
        if (targetProject && targetProject.workspaceId !== workspace.id) {
          targetProject = null;
        }
      }

      if (!targetProject) {
        targetProject = await prisma.project.findFirst({
          where: {
            workspaceId: workspace.id,
            name: {
              equals: trimmedName,
              mode: "insensitive",
            },
          },
        });
      }

      let activeProjectId: string;

      if (targetProject) {
        // Project already exists in Neon: PRESERVE newer database record, do not overwrite
        projectsSkipped++;
        activeProjectId = targetProject.id;
        if (rawProj.id) {
          projectIdMap[rawProj.id] = targetProject.id;
        }
      } else {
        // Create project in Neon, preserving ID if available and not taken
        const projectData: Record<string, any> = {
          workspaceId: workspace.id,
          name: trimmedName,
          description: rawProj.description?.trim() || null,
          status: toPrismaProjectStatus(rawProj.status),
          priority: toPrismaPriority(rawProj.priority),
          startDate: rawProj.startDate ? new Date(rawProj.startDate) : null,
          endDate: rawProj.endDate ? new Date(rawProj.endDate) : null,
          createdAt: rawProj.createdAt ? new Date(rawProj.createdAt) : undefined,
        };

        if (rawProj.id) {
          const idTaken = await prisma.project.findUnique({ where: { id: rawProj.id } });
          if (!idTaken) {
            projectData.id = rawProj.id;
          }
        }

        const created = await prisma.project.create({
          data: projectData as any,
        });
        projectsCreated++;
        activeProjectId = created.id;
        if (rawProj.id) {
          projectIdMap[rawProj.id] = created.id;
        }
      }

      // Process embedded checklist tasks for this project
      const checklist = Array.isArray(rawProj.tasks) ? rawProj.tasks : [];
      for (const item of checklist) {
        if (!item.title || typeof item.title !== "string" || !item.title.trim()) {
          continue;
        }

        const taskTitle = item.title.trim();

        // Check if task already exists by ID or by (workspaceId, projectId, title)
        let existingTask = null;
        if (item.id) {
          existingTask = await prisma.task.findUnique({
            where: { id: item.id },
          });
          if (existingTask && existingTask.workspaceId !== workspace.id) {
            existingTask = null;
          }
        }

        if (!existingTask) {
          existingTask = await prisma.task.findFirst({
            where: {
              workspaceId: workspace.id,
              projectId: activeProjectId,
              title: {
                equals: taskTitle,
                mode: "insensitive",
              },
            },
          });
        }

        if (existingTask) {
          tasksSkipped++;
        } else {
          const checklistTaskData: Record<string, any> = {
            workspaceId: workspace.id,
            projectId: activeProjectId,
            title: taskTitle,
            status: toPrismaTaskStatus(item.status),
            priority: toPrismaPriority(rawProj.priority),
          };

          if (item.id) {
            const idTaken = await prisma.task.findUnique({ where: { id: item.id } });
            if (!idTaken) {
              checklistTaskData.id = item.id;
            }
          }

          await prisma.task.create({
            data: checklistTaskData as any,
          });
          tasksCreated++;
        }
      }
    }

    // ----------------------------------------------------
    // STEP 2: Migrate Standalone / Personal Tasks
    // ----------------------------------------------------
    for (const rawTask of rawTasks) {
      if (!rawTask.title || typeof rawTask.title !== "string" || !rawTask.title.trim()) {
        continue;
      }

      const taskTitle = rawTask.title.trim();

      // Resolve projectId if linked to a project
      let targetProjectId: string | null = null;
      if (rawTask.projectId && rawTask.projectId !== "none") {
        if (projectIdMap[rawTask.projectId]) {
          targetProjectId = projectIdMap[rawTask.projectId];
        } else {
          const existingProj = await prisma.project.findFirst({
            where: {
              workspaceId: workspace.id,
              id: rawTask.projectId,
            },
          });
          if (existingProj) {
            targetProjectId = existingProj.id;
          }
        }
      }

      // Check if task already exists by ID or by title in this workspace
      let existingTask = null;
      if (rawTask.id) {
        existingTask = await prisma.task.findUnique({
          where: { id: rawTask.id },
        });
        if (existingTask && existingTask.workspaceId !== workspace.id) {
          existingTask = null;
        }
      }

      if (!existingTask) {
        existingTask = await prisma.task.findFirst({
          where: {
            workspaceId: workspace.id,
            title: {
              equals: taskTitle,
              mode: "insensitive",
            },
          },
        });
      }

      if (existingTask) {
        tasksSkipped++;
      } else {
        const taskData: Record<string, any> = {
          workspaceId: workspace.id,
          projectId: targetProjectId,
          title: taskTitle,
          status: toPrismaTaskStatus(rawTask.status),
          priority: toPrismaPriority(rawTask.priority),
          dueDate: rawTask.dueDate ? new Date(rawTask.dueDate) : null,
          createdAt: rawTask.createdAt ? new Date(rawTask.createdAt) : undefined,
        };

        if (rawTask.id) {
          const idTaken = await prisma.task.findUnique({ where: { id: rawTask.id } });
          if (!idTaken) {
            taskData.id = rawTask.id;
          }
        }

        await prisma.task.create({
          data: taskData as any,
        });
        tasksCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        projectsCreated,
        projectsSkipped,
        tasksCreated,
        tasksSkipped,
        totalProjectsProcessed: rawProjects.length,
        totalTasksProcessed: rawTasks.length,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/migration/sync-local error]:", errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
