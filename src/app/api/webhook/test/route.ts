import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUrl = body.url?.trim();

    if (!targetUrl) {
      return NextResponse.json({ error: 'Webhook URL cannot be empty' }, { status: 400 });
    }

    // Ambil data ringkasan tugas untuk payload
    const totalCount = await prisma.task.count();
    const completedCount = await prisma.task.count({ where: { status: 'completed' } });
    const pendingCount = await prisma.task.count({ where: { status: 'pending' } });
    const sampleTasks = await prisma.task.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        deadline: true,
        category: true,
      },
    });

    const payload = {
      event: 'test_notification',
      source: 'TaskFlow Productivity Tracker',
      timestamp: new Date().toISOString(),
      summary: {
        totalTasks: totalCount,
        completedTasks: completedCount,
        pendingTasks: pendingCount,
      },
      message: 'Halo! Ini adalah notifikasi uji coba integrasi webhook dari TaskFlow.',
      recentTasks: sampleTasks,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 detik timeout

    let status = 200;
    let statusText = 'OK';
    let responseBody = '';

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TaskFlow-Webhook-Client/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      status = response.status;
      statusText = response.statusText;
      try {
        responseBody = await response.text();
      } catch {}
    } catch (err: any) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        {
          success: false,
          error: `Gagal mengirim payload ke URL: ${err.message || 'Network / timeout error'}`,
          payload,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: status >= 200 && status < 300,
      statusCode: status,
      statusText,
      message:
        status >= 200 && status < 300
          ? 'Webhook berhasil menerima sinyal uji coba (HTTP ' + status + ')!'
          : `Webhook merespons dengan status error: HTTP ${status}`,
      payload,
    });
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
