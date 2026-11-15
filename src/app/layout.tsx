import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow | Dark Glassmorphism Productivity & Task Tracker',
  description: 'Full-stack task manager with real-time filters, calendar view, statistics, and webhook automation integration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
