import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial task and productivity data...');
  
  // Clear existing
  await prisma.task.deleteMany();
  await prisma.webhookConfig.deleteMany();

  const now = new Date();
  
  // Deadline today (in 3 hours)
  const todayDeadline = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  // Deadline tomorrow
  const tomorrowDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // Deadline yesterday (completed)
  const yesterdayDeadline = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  // Deadline in 3 days
  const threeDaysDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  // Deadline next week
  const nextWeekDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const tasks = [
    {
      title: 'Review Sprint Backlog & Roadmap',
      description: 'Prioritaskan item sprint Q4 bersama engineering team dan tentukan target MVP.',
      category: 'Productivity',
      priority: 'high',
      status: 'pending',
      deadline: todayDeadline,
    },
    {
      title: 'Setup Production Server & Docker CI/CD',
      description: 'Konfigurasi VPS Linux, setup Docker container, dan otomatisasi deployment dengan GitHub Actions.',
      category: 'DevOps',
      priority: 'high',
      status: 'pending',
      deadline: tomorrowDeadline,
    },
    {
      title: 'Desain UI Glassmorphism Dark Mode',
      description: 'Membuat mockup sistem kartu tugas modern dengan efek glowing border transparan dan blur.',
      category: 'Design',
      priority: 'medium',
      status: 'completed',
      deadline: yesterdayDeadline,
    },
    {
      title: 'Dokumentasi REST API & Webhook Payload',
      description: 'Tulis spesifikasi endpoint JSON untuk integrasi bot Telegram dan workflow otomasi n8n.',
      category: 'Backend',
      priority: 'medium',
      status: 'pending',
      deadline: threeDaysDeadline,
    },
    {
      title: 'Riset Komponen Kalender & Chart Interaktif',
      description: 'Eksplorasi library visualisasi timeline deadline yang ringan dan responsif di mobile browser.',
      category: 'Research',
      priority: 'low',
      status: 'pending',
      deadline: nextWeekDeadline,
    },
  ];

  for (const item of tasks) {
    await prisma.task.create({ data: item });
  }

  await prisma.webhookConfig.create({
    data: {
      name: 'Telegram Bot Notifier',
      url: 'https://httpbin.org/post',
      active: true,
    },
  });

  console.log('Seeding finished successfully! 5 tasks and 1 webhook config added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
