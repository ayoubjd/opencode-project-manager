"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Task, Column, TaskStatus, STATUS_LABELS, Project } from "@/lib/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { TaskDialog } from "./TaskDialog";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { ExportDialog } from "./ExportDialog";
import { Plus, Download } from "lucide-react";

function buildColumns(tasks: Task[]): Column[] {
  const statuses: TaskStatus[] = ["todo", "in-progress", "done"];
  return statuses.map((status) => ({
    id: status,
    title: STATUS_LABELS[status],
    tasks: tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order),
  }));
}

async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  const projectNames: Record<string, string> = {};
  for (const p of projects) {
    projectNames[p.id] = p.name;
  }

  const columns = buildColumns(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const draggedTask = tasks.find((t) => t.id === activeId);
      if (!draggedTask) return;

      const overTask = tasks.find((t) => t.id === overId);
      const targetStatus: TaskStatus = overTask
        ? overTask.status
        : (over.id as TaskStatus);

      const sameStatus = draggedTask.status === targetStatus;
      const colTasks = tasks
        .filter((t) => t.status === targetStatus && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      // Determine new position
      let newOrder: number;
      if (!overTask || overTask.id === activeId) {
        newOrder = colTasks.length > 0 ? colTasks[colTasks.length - 1].order + 1 : 0;
      } else {
        const overIndex = colTasks.findIndex((t) => t.id === overId);
        if (overIndex === 0) {
          newOrder = colTasks[0].order - 1;
        } else {
          newOrder =
            overIndex === -1
              ? colTasks.length > 0
                ? colTasks[colTasks.length - 1].order + 1
                : 0
              : (colTasks[overIndex - 1].order + colTasks[overIndex].order) / 2;
        }
      }

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? { ...t, status: targetStatus, order: newOrder }
            : t
        )
      );

      try {
        await updateTask(activeId, { status: targetStatus, order: newOrder });
      } catch {
        await load();
      }
    },
    [tasks]
  );

  const handleSave = async (data: Omit<Task, "id" | "createdAt">) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    await load();
    setEditingTask(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDetailTask(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Kanban Board
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              projectNames={projectNames}
              onTaskClick={(task) => setDetailTask(task)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-80 opacity-90">
              <KanbanCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {detailTask && (
        <TaskDetailDialog
          task={detailTask}
          projectName={projectNames[detailTask.projectId] || ""}
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
        onSave={handleSave}
        initial={editingTask}
      />

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
