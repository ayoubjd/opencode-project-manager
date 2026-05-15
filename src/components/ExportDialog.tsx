"use client";

import { useState } from "react";
import { X, Download, FileJson, FileSpreadsheet } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const fetchAll = async () => {
    const [tasks, projects] = await Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]);
    return { tasks, projects };
  };

  const exportJSON = async () => {
    setLoading(true);
    try {
      const data = await fetchAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, "projectflow-export.json");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    setLoading(true);
    try {
      const { tasks, projects } = await fetchAll();
      const projectMap: Record<string, string> = {};
      for (const p of projects) projectMap[p.id] = p.name;

      const headers = [
        "Title",
        "Project",
        "Status",
        "Priority",
        "Assignee",
        "Due Date",
        "Created",
        "Description",
      ];
      const rows = tasks.map((t: Record<string, string>) => [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(projectMap[t.projectId] || "Unknown").replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        `"${t.assignee.replace(/"/g, '""')}"`,
        t.dueDate
          ? new Date(t.dueDate).toLocaleDateString()
          : "",
        new Date(t.createdAt).toLocaleDateString(),
        `"${(t.description || "").replace(/"/g, '""')}"`,
      ]);

      const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join(
        "\n"
      );
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(blob, "projectflow-export.csv");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Export Data
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Export all tasks and projects as a file.
          </p>
          <button
            onClick={exportJSON}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left disabled:opacity-50"
          >
            <FileJson className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Export as JSON
              </p>
              <p className="text-xs text-zinc-400">
                Full data with all fields
              </p>
            </div>
            <Download className="h-5 w-5 text-zinc-400 ml-auto" />
          </button>
          <button
            onClick={exportCSV}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left disabled:opacity-50"
          >
            <FileSpreadsheet className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Export as CSV
              </p>
              <p className="text-xs text-zinc-400">
                Open in Excel or Google Sheets
              </p>
            </div>
            <Download className="h-5 w-5 text-zinc-400 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
