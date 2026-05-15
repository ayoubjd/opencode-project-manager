"use client";

import { X, Trash2, Pencil, Calendar } from "lucide-react";
import { Task } from "@/lib/types";

interface TaskDetailDialogProps {
  task: Task;
  projectName: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TaskDetailDialog({
  task,
  projectName,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailDialogProps) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Description
            </label>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              {task.description || "No description"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Project
              </label>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {projectName || "Unknown"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Assignee
              </label>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {task.assignee || "Unassigned"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Status
              </label>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {STATUS_LABELS[task.status] || task.status}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Priority
              </label>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {PRIORITY_LABELS[task.priority] || task.priority}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Due Date
              </label>
              <p className="mt-1 text-sm font-medium flex items-center gap-1.5">
                {task.dueDate ? (
                  <>
                    <Calendar
                      className={`h-4 w-4 ${
                        isOverdue
                          ? "text-red-500"
                          : "text-zinc-400"
                      }`}
                    />
                    <span
                      className={
                        isOverdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-700 dark:text-zinc-300"
                      }
                    >
                      {new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue && " (Overdue)"}
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500">
                    No due date
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Created
              </label>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
