import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title.trim();
    if (body.description !== undefined) dataToUpdate.description = body.description ? body.description.trim() : null;
    if (body.category !== undefined) dataToUpdate.category = body.category ? body.category.trim() : 'General';
    if (body.priority !== undefined) dataToUpdate.priority = body.priority;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.deadline !== undefined) {
      dataToUpdate.deadline = body.deadline ? new Date(body.deadline) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
