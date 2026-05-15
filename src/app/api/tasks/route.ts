import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const maxOrder = await prisma.task.aggregate({
    _max: { order: true },
    where: { status: body.status ?? "todo" },
  });
  const task = await prisma.task.create({
    data: {
      projectId: body.projectId,
      title: body.title,
      description: body.description ?? "",
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      assignee: body.assignee ?? "",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  return NextResponse.json(task, { status: 201 });
}
