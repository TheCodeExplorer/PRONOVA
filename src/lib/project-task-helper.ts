import { ProjectStatus, Priority, TaskStatus } from "@prisma/client";

export function formatToReadableDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Project Status Mappings
export function toPrismaProjectStatus(status?: string): ProjectStatus {
  if (status === "Completed") return ProjectStatus.COMPLETED;
  if (status === "In Progress") return ProjectStatus.IN_PROGRESS;
  return ProjectStatus.PLANNING;
}

export function fromPrismaProjectStatus(
  status: ProjectStatus
): "Planning" | "In Progress" | "Completed" {
  if (status === ProjectStatus.COMPLETED) return "Completed";
  if (status === ProjectStatus.IN_PROGRESS) return "In Progress";
  return "Planning";
}

// Priority Mappings
export function toPrismaPriority(priority?: string): Priority {
  if (priority === "High") return Priority.HIGH;
  if (priority === "Low") return Priority.LOW;
  return Priority.MEDIUM;
}

export function fromPrismaPriority(priority: Priority): "Low" | "Medium" | "High" {
  if (priority === Priority.HIGH) return "High";
  if (priority === Priority.LOW) return "Low";
  return "Medium";
}

// Task Status Mappings
export function toPrismaTaskStatus(status?: string): TaskStatus {
  if (status === "Completed" || status === "Done") return TaskStatus.DONE;
  if (status === "In Progress") return TaskStatus.IN_PROGRESS;
  if (status === "Backlog") return TaskStatus.BACKLOG;
  return TaskStatus.TODO;
}

export function fromPrismaTaskStatus(
  status: TaskStatus
): "Todo" | "In Progress" | "Completed" {
  if (status === TaskStatus.DONE) return "Completed";
  if (status === TaskStatus.IN_PROGRESS) return "In Progress";
  return "Todo";
}

export function fromPrismaChecklistStatus(
  status: TaskStatus
): "Todo" | "In Progress" | "Done" {
  if (status === TaskStatus.DONE) return "Done";
  if (status === TaskStatus.IN_PROGRESS) return "In Progress";
  return "Todo";
}
