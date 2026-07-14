import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await params;
  const body = await request.json();

  const data: { title?: string; completed?: boolean } = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.completed === "boolean") data.completed = body.completed;

  try {
    const task = await prisma.task.update({ where: { id }, data });
    return NextResponse.json(task);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await params;

  try {
    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    throw error;
  }
}
