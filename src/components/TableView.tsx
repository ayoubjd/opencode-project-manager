"use client";

import { useState, useEffect } from "react";
import {
  Task,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  Project,
} from "@/lib/types";
import { TaskDialog } from "./TaskDialog";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { ExportDialog } from "./ExportDialog";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";

export function TableView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [exportOpen, setExportOpen] = useState(false);

  const load = () =>
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([t, p]) => {
      setTasks(t);
      setProjects(p);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const getProjectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "Unknown";

  const filteredTasks = tasks.filter((t) => {
    if (filterProject !== "all" && t.projectId !== filterProject) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (
        !t.title.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q) &&
        !t.assignee.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDetailTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 dark:text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="pt-14 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Table View
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => {
              setEditingTask(undefined);
              setDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="all">All Projects</option>
          {projects.map((p: Project) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Title
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Project
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Status
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Priority
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Assignee
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Due Date
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                Created
              </th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => {
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== "done";
              return (
                <tr
                  key={task.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td
                    className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => setDetailTask(task)}
                  >
                    {task.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {getProjectName(task.projectId)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_COLORS[
                          task.status as keyof typeof STATUS_COLORS
                        ]
                      }`}
                    >
                      {
                        STATUS_LABELS[
                          task.status as keyof typeof STATUS_LABELS
                        ]
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        PRIORITY_COLORS[
                          task.priority as keyof typeof PRIORITY_COLORS
                        ]
                      }`}
                    >
                      {
                        PRIORITY_LABELS[
                          task.priority as keyof typeof PRIORITY_LABELS
                        ]
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {task.assignee}
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span
                        className={`text-xs ${
                          isOverdue
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue && " ⚠"}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setDialogOpen(true);
                        }}
                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
            No tasks found
          </div>
        )}
      </div>

      {detailTask && (
        <TaskDetailDialog
          task={detailTask}
          projectName={getProjectName(detailTask.projectId)}
          onClose={() => setDetailTask(null)}
          onEdit={() => {
            setEditingTask(detailTask);
            setDialogOpen(true);
            setDetailTask(null);
          }}
          onDelete={() => handleDelete(detailTask.id)}
        />
      )}

      <TaskDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(undefined);
        }}
        onSave={async (data) => {
          if (editingTask) {
            await fetch(`/api/tasks/${editingTask.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
          } else {
            await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
          }
          await load();
          setEditingTask(undefined);
        }}
        initial={editingTask}
      />

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
