"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: string;
  isOverdue?: boolean;
  isCompleted?: boolean;
  onToggle?: () => void;
}

export function TaskItem({ task, isOverdue, isCompleted: controlledCompleted, onToggle }: TaskItemProps) {
  const [localCompleted, setLocalCompleted] = useState(false);
  
  const isCompleted = controlledCompleted !== undefined ? controlledCompleted : localCompleted;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCompleted(!localCompleted);
    }
  };

  return (
    <div 
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
        isCompleted 
          ? "bg-indigo-50/50 border-indigo-100 opacity-75" 
          : "border-gray-100 hover:border-indigo-200 hover:shadow-sm bg-white dark:bg-gray-900 dark:border-gray-800",
        isOverdue && !isCompleted && "border-red-100 bg-red-50/20"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded flex items-center justify-center border-2 transition-all",
        isCompleted 
          ? "bg-indigo-600 border-indigo-600 text-white" 
          : cn("border-gray-200 group-hover:border-indigo-400", isOverdue && "border-red-200")
      )}>
        {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
      </div>
      <div className="flex flex-col flex-1">
        <span className={cn(
          "text-sm font-medium transition-all",
          isCompleted ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"
        )}>
          {task}
        </span>
        {isOverdue && !isCompleted && (
          <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Due Yesterday</span>
        )}
      </div>
    </div>
  );
}
