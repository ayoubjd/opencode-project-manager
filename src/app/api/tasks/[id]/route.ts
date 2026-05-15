import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.projectId !== undefined) updateData.projectId = body.projectId;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.assignee !== undefined) updateData.assignee = body.assignee;
  if (body.dueDate !== undefined)
    updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.order !== undefined) updateData.order = body.order;

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(task);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
