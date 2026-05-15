import { prisma } from "@/lib/prisma";
import { FolderKanban, ListTodo, Users, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.task.findMany(),
  ]);

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: FolderKanban,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: "Completed",
      value: doneTasks,
      icon: Users,
      color: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

  return (
    <div className="pt-14 lg:pt-0">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {label}
              </span>
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Recent Projects
          </h2>
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {p.name}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {p.description}
                  </p>
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {p.createdAt.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Task Overview
          </h2>
          <div className="space-y-4">
            {(["todo", "in-progress", "done"] as const).map((status) => {
              const count = tasks.filter((t) => t.status === status).length;
              const pct = totalTasks
                ? Math.round((count / totalTasks) * 100)
                : 0;
              const barColor =
                status === "todo"
                  ? "bg-gray-400 dark:bg-gray-600"
                  : status === "in-progress"
                    ? "bg-yellow-400 dark:bg-yellow-600"
                    : "bg-green-400 dark:bg-green-600";
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium capitalize">
                      {status === "in-progress" ? "In Progress" : status}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
