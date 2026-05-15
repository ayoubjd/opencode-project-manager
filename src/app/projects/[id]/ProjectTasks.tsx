"use client";

import { useState, useCallback } from "react";
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
import {
  Task,
  TaskStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  Column,
} from "@/lib/types";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCard } from "@/components/KanbanCard";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { Plus, Search, Columns3, Table2 } from "lucide-react";

interface ProjectTasksProps {
  projectId: string;
  initialTasks: Task[];
}

type ViewMode = "kanban" | "table";

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

export function ProjectTasks({
  projectId,
  initialTasks,
}: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<ViewMode>("kanban");

  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchText, setSearchText] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const all = await res.json();
    setTasks(all.filter((t: Task) => t.projectId === projectId));
  }, [projectId]);

  const handleSave = async (data: Omit<Task, "id" | "createdAt">) => {
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
        body: JSON.stringify({ ...data, projectId }),
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

  // ── Kanban ──

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

      const colTasks = tasks
        .filter((t) => t.status === targetStatus && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      let newOrder: number;
      if (!overTask || overTask.id === activeId) {
        newOrder =
          colTasks.length > 0 ? colTasks[colTasks.length - 1].order + 1 : 0;
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

      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? { ...t, status: targetStatus, order: newOrder }
            : t
        )
      );

      await fetch(`/api/tasks/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus, order: newOrder }),
      });
    },
    [tasks]
  );

  // ── Derived ──

  const filteredTasks = searchText
    ? tasks.filter((t) => {
        const q = searchText.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
        );
      })
    : tasks;

  const columns = buildColumns(filteredTasks);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Tasks ({tasks.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === "kanban"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <Columns3 className="h-4 w-4" />
              Board
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === "table"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <Table2 className="h-4 w-4" />
              Table
            </button>
          </div>
          <button
            onClick={() => {
              setEditingTask(undefined);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Search (table only) */}
      {view === "table" && (
        <div className="relative mb-4 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      )}

      {/* Kanban */}
      {view === "kanban" && (
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
                projectNames={{}}
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
      )}

      {/* Table */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Assignee</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Due Date</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Created</th>
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
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          STATUS_COLORS[task.status]
                        }`}
                      >
                        {STATUS_LABELS[task.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          PRIORITY_COLORS[task.priority]
                        }`}
                      >
                        {PRIORITY_LABELS[task.priority]}
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
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
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
      )}

      {detailTask && (
        <TaskDetailDialog
          task={detailTask}
          projectName=""
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
    </div>
  );
}
