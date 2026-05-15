import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, Column } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: Column;
  projectNames: Record<string, string>;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ column, projectNames, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-xl w-80 shrink-0 max-h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
            {column.title}
          </h3>
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
            {column.tasks.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 space-y-2 min-h-[200px] overflow-y-auto"
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              projectName={projectNames[task.projectId]}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
