'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

export default function CalendarView({ tasks, onSelectTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Senin sebagai hari pertama
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Helper untuk mendapatkan tugas pada tanggal tertentu
  const getTasksForDate = (date: Date) => {
    return tasks.filter((t) => {
      if (!t.deadline) return false;
      try {
        const d = typeof t.deadline === 'string' ? parseISO(t.deadline) : new Date(t.deadline);
        return isSameDay(d, date);
      } catch {
        return false;
      }
    });
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid (Kolom 1 & 2) */}
      <div className="lg:col-span-2 rounded-2xl bg-slate-900/40 p-6 backdrop-blur-xl border border-white/10 shadow-xl">
        {/* Header navigasi bulan */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <p className="text-xs text-slate-400">Jadwal deadline dan timeline tugas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-white/5 transition-colors"
            >
              Hari Ini
            </button>
            <div className="flex items-center rounded-lg bg-slate-800/80 border border-white/5 p-0.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Hari Header */}
        <div className="grid grid-cols-7 gap-1 text-center py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Grid Tanggal */}
        <div className="grid grid-cols-7 gap-1 mt-2">
          {days.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonthDay = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`relative min-h-[75px] sm:min-h-[90px] p-2 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500/70 bg-indigo-500/10 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]'
                    : isCurrentDay
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : isCurrentMonthDay
                    ? 'border-white/5 hover:border-white/20 bg-slate-800/20 hover:bg-slate-800/40'
                    : 'border-transparent text-slate-600 bg-transparent opacity-40'
                }`}
              >
                {/* Tanggal label */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isCurrentDay
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : isSelected
                        ? 'bg-indigo-500 text-white font-bold'
                        : isCurrentMonthDay
                        ? 'text-slate-200'
                        : 'text-slate-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-indigo-300 font-medium">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* List indikator tugas mini */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className={`truncate text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                        t.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                          : t.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] text-slate-400 pl-1">
                      +{dayTasks.length - 2} tugas lainnya
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Tugas Tanggal Terpilih (Kolom 3) */}
      <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Agenda Tanggal
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {format(selectedDate, 'EEEE, d MMMM yyyy')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedDateTasks.length === 0
                ? 'Tidak ada deadline tugas pada tanggal ini'
                : `${selectedDateTasks.length} tugas jatuh tempo`}
            </p>
          </div>

          <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CalendarIcon className="h-10 w-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm">Jadwal kosong pada tanggal ini.</p>
              </div>
            ) : (
              selectedDateTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask && onSelectTask(t)}
                  className={`p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                    t.status === 'completed'
                      ? 'bg-slate-950/40 border-white/5 opacity-70'
                      : 'bg-slate-800/40 border-white/10 hover:border-indigo-500/40 hover:bg-slate-800/70 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        t.priority === 'high'
                          ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                          : t.priority === 'medium'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      {t.status}
                    </span>
                  </div>
                  <h4
                    className={`mt-2 font-semibold text-sm ${
                      t.status === 'completed' ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {t.title}
                  </h4>
                  {t.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                  {t.deadline && (
                    <div className="mt-2 text-[11px] text-slate-400">
                      ⏰ Pukul {format(new Date(t.deadline), 'HH:mm')} WIB
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low
          </span>
        </div>
      </div>
    </div>
  );
}
