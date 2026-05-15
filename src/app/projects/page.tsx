"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FolderKanban, ExternalLink } from "lucide-react";
import { Project } from "@/lib/types";
import { ProjectDialog } from "@/components/ProjectDialog";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data: { name: string; description: string }) => {
    if (editing) {
      const res = await fetch(`/api/projects/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === editing.id ? updated : p))
      );
    } else {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setProjects((prev) => [...prev, created]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 dark:text-zinc-500 pt-14 lg:pt-0">
        Loading...
      </div>
    );
  }

  return (
    <div className="pt-14 lg:pt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Projects
        </h1>
        <button
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-indigo-500 shrink-0" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {project.name}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditing(project);
                    setDialogOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex-1 line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                View Tasks
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <ProjectDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(undefined);
        }}
        onSave={handleSave}
        initial={
          editing
            ? { name: editing.name, description: editing.description }
            : undefined
        }
      />
    </div>
  );
}
