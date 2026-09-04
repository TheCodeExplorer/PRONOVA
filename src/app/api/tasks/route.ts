import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateActiveWorkspace } from "@/lib/workspace-helper";
import {
  toPrismaTaskStatus,
  fromPrismaTaskStatus,
  toPrismaPriority,
  fromPrismaPriority,
} from "@/lib/project-task-helper";

/**
 * GET /api/tasks: List all tasks in the user's active workspace.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { workspace } = await getOrCreateActiveWorkspace(userId);

    const dbTasks = await prisma.task.findMany({
      where: { workspaceId: workspace.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const tasks = dbTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: fromPrismaTaskStatus(t.status),
      priority: fromPrismaPriority(t.priority),
      dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : undefined,
      projectId: t.projectId || undefined,
      projectName: t.project?.name,
      createdAt: t.createdAt.getTime(),
    }));

    return NextResponse.json({ success: true, tasks });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/tasks error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/tasks: Create a task in the active workspace.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { workspace } = await getOrCreateActiveWorkspace(userId);

    const body = await request.json();
    const { title, status, priority, dueDate, projectId } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Task title is required." },
        { status: 400 }
      );
    }

    // Validate projectId belongs to the same workspace if provided
    let validProjectId: string | null = null;
    if (projectId && projectId !== "none") {
      const existingProject = await prisma.project.findUnique({
        where: { id: projectId, workspaceId: workspace.id },
      });
      if (!existingProject) {
        return NextResponse.json(
          { success: false, error: "Referenced project does not exist in this workspace." },
          { status: 400 }
        );
      }
      validProjectId = existingProject.id;
    }

    const createdTask = await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: validProjectId,
        title: title.trim(),
        status: toPrismaTaskStatus(status),
        priority: toPrismaPriority(priority),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    const task = {
      id: createdTask.id,
      title: createdTask.title,
      status: fromPrismaTaskStatus(createdTask.status),
      priority: fromPrismaPriority(createdTask.priority),
      dueDate: createdTask.dueDate ? createdTask.dueDate.toISOString().split("T")[0] : undefined,
      projectId: createdTask.projectId || undefined,
      projectName: createdTask.project?.name,
      createdAt: createdTask.createdAt.getTime(),
    };

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/tasks error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
