import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateActiveWorkspace } from "@/lib/workspace-helper";
import {
  toPrismaProjectStatus,
  fromPrismaProjectStatus,
  toPrismaPriority,
  fromPrismaPriority,
  fromPrismaChecklistStatus,
  formatToReadableDate,
} from "@/lib/project-task-helper";

/**
 * PATCH /api/projects/[id]: Update a workspace project.
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

    // Verify project exists in user's workspace
    const existingProject = await prisma.project.findUnique({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found in this workspace." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, status, priority, startDate, endDate } = body;

    const dataToUpdate: Record<string, any> = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (status !== undefined) dataToUpdate.status = toPrismaProjectStatus(status);
    if (priority !== undefined) dataToUpdate.priority = toPrismaPriority(priority);
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;

    const updated = await prisma.project.update({
      where: { id, workspaceId: workspace.id },
      data: dataToUpdate,
      include: {
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const project = {
      id: updated.id,
      name: updated.name,
      description: updated.description || "",
      status: fromPrismaProjectStatus(updated.status),
      priority: fromPrismaPriority(updated.priority),
      startDate: updated.startDate ? updated.startDate.toISOString().split("T")[0] : "",
      endDate: updated.endDate ? updated.endDate.toISOString().split("T")[0] : "",
      tasks: updated.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: fromPrismaChecklistStatus(t.status),
      })),
      tasksCount: updated.tasks.length,
      dueDate: updated.endDate ? formatToReadableDate(updated.endDate.toISOString().split("T")[0]) : "",
      createdAt: updated.createdAt.getTime(),
    };

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[PATCH /api/projects/[id] error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]: Delete a workspace project.
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

    const existingProject = await prisma.project.findUnique({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found in this workspace." },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id, workspaceId: workspace.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[DELETE /api/projects/[id] error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
