'use client';

import React from 'react';
import { Task } from '@/types';
import { format, isToday, isPast, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  AlertCircle,
  Flame,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityConfig = {
  high: {
    label: 'High Priority',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    hoverGlow: 'hover:shadow-[0_0_20px_-3px_rgba(244,63,94,0.35)] hover:border-rose-500/40',
    dot: 'bg-rose-500',
  },
  medium: {
    label: 'Medium Priority',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    hoverGlow: 'hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)] hover:border-amber-500/40',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low Priority',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    hoverGlow: 'hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)] hover:border-emerald-500/40',
    dot: 'bg-emerald-500',
  },
};

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  // Deadline calculation
  let deadlineDate: Date | null = null;
  let isDueToday = false;
  let isOverdue = false;

  if (task.deadline) {
    try {
      deadlineDate = typeof task.deadline === 'string' ? parseISO(task.deadline) : new Date(task.deadline);
      isDueToday = isToday(deadlineDate);
      isOverdue = isPast(deadlineDate) && !isDueToday && !isCompleted;
    } catch {
      deadlineDate = null;
    }
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-slate-900/50 p-5 backdrop-blur-xl border border-white/10 transition-all duration-300 ${priority.hoverGlow} ${
        isCompleted ? 'opacity-70 bg-slate-950/40' : 'hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Header: Tag, Priority, Deadline indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${priority.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>

            {/* Category */}
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                <Tag className="h-3 w-3 text-indigo-400" />
                {task.category}
              </span>
            )}
          </div>

          {/* Due Today / Overdue pill */}
          {isDueToday && !isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Flame className="h-3 w-3 text-amber-400" />
              Hari Ini!
            </span>
          )}
          {isOverdue && !isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <AlertCircle className="h-3 w-3 text-rose-400" />
              Terlambat
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="mb-4">
          <h3
            className={`text-base font-semibold leading-snug transition-colors ${
              isCompleted
                ? 'line-through text-slate-400'
                : 'text-white group-hover:text-indigo-200'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
        {/* Deadline text */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {deadlineDate ? (
            <>
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span
                className={
                  isDueToday && !isCompleted
                    ? 'text-amber-300 font-medium'
                    : isOverdue && !isCompleted
                    ? 'text-rose-400 font-medium'
                    : 'text-slate-300'
                }
              >
                {format(deadlineDate, 'd MMM yyyy, HH:mm')}
              </span>
            </>
          ) : (
            <span className="text-slate-500 italic">Tanpa deadline</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Toggle status */}
          <button
            onClick={() => onToggleStatus(task)}
            title={isCompleted ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
            className={`p-1.5 rounded-lg transition-colors ${
              isCompleted
                ? 'text-emerald-400 hover:bg-emerald-500/20'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(task)}
            title="Edit Tugas"
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(task.id)}
            title="Hapus Tugas"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
