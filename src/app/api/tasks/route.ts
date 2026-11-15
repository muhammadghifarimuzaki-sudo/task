import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    // Build Prisma query condition
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // pending first
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category: body.category?.trim() || 'General',
        priority: body.priority || 'medium',
        status: body.status || 'pending',
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    // Optionally notify active webhook asynchronously
    try {
      const webhook = await prisma.webhookConfig.findFirst({ where: { active: true } });
      if (webhook && webhook.url) {
        fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'task_created',
            timestamp: new Date().toISOString(),
            task,
          }),
        }).catch(() => {});
      }
    } catch {}

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
