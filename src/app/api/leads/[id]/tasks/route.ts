import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const tasks = await prisma.task.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await req.json();
  const { title, dueDate, assignedTo } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      leadId: id,
      title,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo ?? null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id: _leadId } = await params;
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "taskId query param required" }, { status: 400 });
  }

  const body = await req.json();
  const { isCompleted, title, dueDate } = body;

  const data: Record<string, unknown> = {};
  if (isCompleted !== undefined) data.isCompleted = isCompleted;
  if (title !== undefined) data.title = title;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

  const task = await prisma.task.update({ where: { id: taskId }, data });
  return NextResponse.json(task);
}
