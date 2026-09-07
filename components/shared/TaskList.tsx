"use client";

import React, { useState } from "react";
import { CheckSquare, Square, Clock, Send, Layers } from "lucide-react";
import { FollowUpTask } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TaskListProps {
  initialTasks: FollowUpTask[];
  onToggleTask?: (taskId: string, completed: boolean) => void;
  className?: string;
}

export function TaskList({
  initialTasks,
  onToggleTask,
  className,
}: TaskListProps) {
  const [tasks, setTasks] = useState<FollowUpTask[]>(initialTasks);

  const handleToggle = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = !t.completed;
          if (onToggleTask) onToggleTask(taskId, updated);
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const priorityStyles = {
    urgent: "bg-red-50 text-red-700 border-red-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className={cn("divide-y divide-slate-100", className)}>
      {tasks.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400">
          No open follow-up tasks.
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "p-3.5 flex items-start justify-between gap-3 transition-colors",
              task.completed ? "bg-slate-50/60 opacity-65" : "hover:bg-slate-50/40"
            )}
          >
            <div className="flex items-start space-x-3 flex-1">
              <button
                type="button"
                onClick={() => handleToggle(task.id)}
                className="mt-0.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
              >
                {task.completed ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                      priorityStyles[task.priority] || priorityStyles.low
                    )}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold text-slate-900 leading-tight",
                      task.completed && "line-through text-slate-500"
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {task.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-medium pt-0.5">
                  <span>
                    Assigned:{" "}
                    <span className="text-slate-700 capitalize">
                      {task.assignedTo.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Due {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
            </div>

            {task.syncDestination && (
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono shrink-0 uppercase flex items-center space-x-1">
                {task.syncDestination === "encompass" ? (
                  <Layers className="h-3 w-3 text-emerald-600 mr-1" />
                ) : (
                  <Send className="h-3 w-3 text-blue-600 mr-1" />
                )}
                <span>{task.syncDestination}</span>
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
