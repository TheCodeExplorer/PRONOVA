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
 * PATCH /api/tasks/[id]: Update a workspace task.
 */
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await props.params;
    const { workspace } = await getOrCreateActiveWorkspace(userId);

    const existingTask = await prisma.task.findUnique({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found in this workspace." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, status, priority, dueDate, projectId } = body;

    const dataToUpdate: Record<string, any> = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (status !== undefined) dataToUpdate.status = toPrismaTaskStatus(status);
    if (priority !== undefined) dataToUpdate.priority = toPrismaPriority(priority);
    if (dueDate !== undefined) dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;

    if (projectId !== undefined) {
      if (projectId === null || projectId === "none") {
        dataToUpdate.projectId = null;
      } else {
        const existingProject = await prisma.project.findUnique({
          where: { id: projectId, workspaceId: workspace.id },
        });
        if (!existingProject) {
          return NextResponse.json(
            { success: false, error: "Referenced project does not exist in this workspace." },
            { status: 400 }
          );
        }
        dataToUpdate.projectId = existingProject.id;
      }
    }

    const updated = await prisma.task.update({
      where: { id, workspaceId: workspace.id },
      data: dataToUpdate,
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    const task = {
      id: updated.id,
      title: updated.title,
      status: fromPrismaTaskStatus(updated.status),
      priority: fromPrismaPriority(updated.priority),
      dueDate: updated.dueDate ? updated.dueDate.toISOString().split("T")[0] : undefined,
      projectId: updated.projectId || undefined,
      projectName: updated.project?.name,
      createdAt: updated.createdAt.getTime(),
    };

    return NextResponse.json({ success: true, task });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[PATCH /api/tasks/[id] error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]: Delete a workspace task.
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await props.params;
    const { workspace } = await getOrCreateActiveWorkspace(userId);

    const existingTask = await prisma.task.findUnique({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found in this workspace." },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id, workspaceId: workspace.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[DELETE /api/tasks/[id] error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
