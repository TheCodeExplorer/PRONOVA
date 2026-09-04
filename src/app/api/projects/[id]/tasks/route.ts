import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateActiveWorkspace } from "@/lib/workspace-helper";
import { TaskStatus } from "@prisma/client";
import { fromPrismaChecklistStatus } from "@/lib/project-task-helper";

/**
 * POST /api/projects/[id]/tasks: Add a checklist task to a project.
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { id: projectId } = await props.params;
    const { workspace } = await getOrCreateActiveWorkspace(userId);

    // Verify project belongs to workspace
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId, workspaceId: workspace.id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found in this workspace." },
        { status: 404 }
      );
    }

    const { title } = await request.json();
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Task title is required." },
        { status: 400 }
      );
    }

    const createdTask = await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: existingProject.id,
        title: title.trim(),
        status: TaskStatus.TODO,
      },
    });

    return NextResponse.json(
      {
        success: true,
        task: {
          id: createdTask.id,
          title: createdTask.title,
          status: fromPrismaChecklistStatus(createdTask.status),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/projects/[id]/tasks error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
