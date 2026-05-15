import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types";
import { GripVertical } from "lucide-react";

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

interface KanbanCardProps {
  task: Task;
  projectName?: string;
  onClick: () => void;
}

export function KanbanCard({ task, projectName, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
              {task.title}
            </p>
            {projectName && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                {projectName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 pl-6">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              PRIORITY_COLORS[task.priority] || ""
            }`}
          >
            {PRIORITY_LABELS[task.priority] || task.priority}
          </span>
          {task.dueDate && (
            <span
              className={`text-xs ${
                isOverdue
                  ? "text-red-500 dark:text-red-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {task.assignee && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {task.assignee}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
