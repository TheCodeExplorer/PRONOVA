import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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
 * GET /api/projects: List all projects for the authenticated user's active workspace.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress;
    const fullName =
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      clerkUser?.username ||
      "Admin";
    const avatar = clerkUser?.imageUrl;

    const { workspace } = await getOrCreateActiveWorkspace(userId, {
      email: primaryEmail,
      name: fullName,
      avatar,
    });

    const dbProjects = await prisma.project.findMany({
      where: { workspaceId: workspace.id },
      include: {
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const projects = dbProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      status: fromPrismaProjectStatus(p.status),
      priority: fromPrismaPriority(p.priority),
      startDate: p.startDate ? p.startDate.toISOString().split("T")[0] : "",
      endDate: p.endDate ? p.endDate.toISOString().split("T")[0] : "",
      tasks: p.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: fromPrismaChecklistStatus(t.status),
      })),
      tasksCount: p.tasks.length,
      dueDate: p.endDate ? formatToReadableDate(p.endDate.toISOString().split("T")[0]) : "",
      createdAt: p.createdAt.getTime(),
    }));

    return NextResponse.json({ success: true, projects });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/projects error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/projects: Create a project in the active workspace.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { workspace } = await getOrCreateActiveWorkspace(userId);

    const body = await request.json();
    const { name, description, status, priority, startDate, endDate } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Project name is required." },
        { status: 400 }
      );
    }

    const createdProject = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: name.trim(),
        description: description?.trim() || null,
        status: toPrismaProjectStatus(status),
        priority: toPrismaPriority(priority),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        tasks: true,
      },
    });

    const project = {
      id: createdProject.id,
      name: createdProject.name,
      description: createdProject.description || "",
      status: fromPrismaProjectStatus(createdProject.status),
      priority: fromPrismaPriority(createdProject.priority),
      startDate: createdProject.startDate ? createdProject.startDate.toISOString().split("T")[0] : "",
      endDate: createdProject.endDate ? createdProject.endDate.toISOString().split("T")[0] : "",
      tasks: [],
      tasksCount: 0,
      dueDate: createdProject.endDate
        ? formatToReadableDate(createdProject.endDate.toISOString().split("T")[0])
        : "",
      createdAt: createdProject.createdAt.getTime(),
    };

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/projects error]:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
