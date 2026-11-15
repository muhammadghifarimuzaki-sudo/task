'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  colorScheme: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  indigo: {
    border: 'border-indigo-500/20 hover:border-indigo-500/50',
    iconBg: 'bg-indigo-500/10 text-indigo-400',
    glow: 'hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.35)]',
    text: 'text-indigo-400',
    indicator: 'bg-indigo-500',
  },
  emerald: {
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    glow: 'hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.35)]',
    text: 'text-emerald-400',
    indicator: 'bg-emerald-500',
  },
  amber: {
    border: 'border-amber-500/20 hover:border-amber-500/50',
    iconBg: 'bg-amber-500/10 text-amber-400',
    glow: 'hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.35)]',
    text: 'text-amber-400',
    indicator: 'bg-amber-500',
  },
  rose: {
    border: 'border-rose-500/20 hover:border-rose-500/50',
    iconBg: 'bg-rose-500/10 text-rose-400',
    glow: 'hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.35)]',
    text: 'text-rose-400',
    indicator: 'bg-rose-500',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
}: StatsCardProps) {
  const styles = colorMap[colorScheme];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900/40 p-5 backdrop-blur-xl border transition-all duration-300 ${styles.border} ${styles.glow} group hover:-translate-y-1`}
    >
      {/* Background soft ambient highlight */}
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-30 ${styles.indicator}`}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {value}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110 ${styles.iconBg}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
