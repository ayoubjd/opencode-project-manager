export type TaskStatus = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  dueDate: string | null;
  order: number;
  createdAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "in-progress": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
};
