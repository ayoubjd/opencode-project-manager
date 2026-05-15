import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Task } from "@/lib/types";
import { ProjectTasks } from "./ProjectTasks";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, tasks] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.task.findMany({
      where: { projectId: id },
      orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!project) notFound();

  return (
    <div className="pt-14 lg:pt-0">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <FolderKanban className="h-7 w-7 text-indigo-500" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {project.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {project.description}
          </p>
        </div>
      </div>
      <ProjectTasks
        projectId={project.id}
        initialTasks={tasks.map((t) => ({
          id: t.id,
          projectId: t.projectId,
          title: t.title,
          description: t.description,
          status: t.status as Task["status"],
          priority: t.priority as Task["priority"],
          assignee: t.assignee,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          order: t.order,
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
