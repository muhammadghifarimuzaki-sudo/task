import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.webhookConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(config || { url: '', name: 'Default Webhook', active: false });
  } catch (error) {
    console.error('Error fetching webhook config:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name, active } = body;

    const existing = await prisma.webhookConfig.findFirst();

    let saved;
    if (existing) {
      saved = await prisma.webhookConfig.update({
        where: { id: existing.id },
        data: {
          url: url || '',
          name: name || 'My Webhook',
          active: active !== undefined ? Boolean(active) : true,
        },
      });
    } else {
      saved = await prisma.webhookConfig.create({
        data: {
          url: url || '',
          name: name || 'My Webhook',
          active: active !== undefined ? Boolean(active) : true,
        },
      });
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error saving webhook config:', error);
    return NextResponse.json({ error: 'Failed to save webhook config' }, { status: 500 });
  }
}
