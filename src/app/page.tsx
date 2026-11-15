'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, Priority } from '@/types';
import StatsCard from '@/components/StatsCard';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import CalendarView from '@/components/CalendarView';
import WebhookModal from '@/components/WebhookModal';
import { isToday, parseISO } from 'date-fns';
import {
  CheckSquare2,
  Clock,
  ListTodo,
  CalendarDays,
  Plus,
  Search,
  Filter,
  Webhook,
  LayoutGrid,
  Calendar,
  Sparkles,
  RefreshCw,
  Database,
  Layers,
} from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks client-side for smooth real-time experience
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesCategory = task.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }

      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = total - completed;

    const dueToday = tasks.filter((t) => {
      if (!t.deadline || t.status === 'completed') return false;
      try {
        const d = typeof t.deadline === 'string' ? parseISO(t.deadline) : new Date(t.deadline);
        return isToday(d);
      } catch {
        return false;
      }
    }).length;

    return { total, completed, pending, dueToday };
  }, [tasks]);

  // Task actions
  const handleCreateOrUpdateTask = async (taskData: Partial<Task>) => {
    if (taskToEdit) {
      // Update
      const res = await fetch(`/api/tasks/${taskToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        await fetchTasks();
      }
    } else {
      // Create
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        await fetchTasks();
      }
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Revert if error
      await fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch {
      await fetchTasks();
    }
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 overflow-x-hidden">
      {/* Background radial gradient glow ambient lights */}
      <div className="fixed top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed top-1/2 right-10 h-[350px] w-[350px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Bar / Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
              <CheckSquare2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Flow</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]">
                  <Database className="h-2.5 w-2.5" /> Neon PostgreSQL Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Glassmorphism Dark Mode Task & Productivity Hub
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/40 hover:text-white transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]"
            >
              <Webhook className="h-4 w-4 text-indigo-400" />
              Webhook Settings
            </button>

            <button
              onClick={handleOpenNewTask}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.6)] hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              Tambah Tugas
            </button>
          </div>
        </header>

        {/* Dashboard Ringkasan (Stats Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Tugas"
            value={stats.total}
            subtitle="Semua tugas tersimpan"
            icon={ListTodo}
            colorScheme="indigo"
          />
          <StatsCard
            title="Tugas Selesai"
            value={stats.completed}
            subtitle={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% rasio selesai`}
            icon={CheckSquare2}
            colorScheme="emerald"
          />
          <StatsCard
            title="Dalam Pengerjaan"
            value={stats.pending}
            subtitle="Menunggu diselesaikan"
            icon={Clock}
            colorScheme="amber"
          />
          <StatsCard
            title="Deadline Hari Ini"
            value={stats.dueToday}
            subtitle="Perlu perhatian segera"
            icon={CalendarDays}
            colorScheme="rose"
          />
        </section>

        {/* Filter & Toolbar Area */}
        <section className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari tugas, kategori, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter buttons & View Mode Switch */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Segmented Buttons */}
              <div className="flex items-center rounded-xl bg-slate-800/70 p-1 border border-white/5">
                {(['all', 'pending', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status === 'all' ? 'Semua' : status === 'pending' ? 'Pending' : 'Selesai'}
                  </button>
                ))}
              </div>

              {/* Priority Select */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-800/70 border border-white/10 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500/70 transition-all"
              >
                <option value="all">Semua Prioritas</option>
                <option value="high">🔴 Prioritas Tinggi</option>
                <option value="medium">🟡 Prioritas Sedang</option>
                <option value="low">🟢 Prioritas Rendah</option>
              </select>

              {/* View Switcher: Grid vs Calendar */}
              <div className="flex items-center rounded-xl bg-slate-800/70 p-1 border border-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Tampilan Grid Tugas"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  title="Tampilan Kalender Deadline"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchTasks}
                title="Muat ulang data"
                className="p-2 rounded-xl bg-slate-800/70 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Content Area: Grid View vs Calendar View */}
        {viewMode === 'calendar' ? (
          <CalendarView
            tasks={filteredTasks}
            onSelectTask={(task) => handleOpenEdit(task)}
          />
        ) : (
          <section>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-44 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse p-5 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="h-4 w-24 bg-slate-800 rounded-full" />
                      <div className="h-5 w-3/4 bg-slate-800 rounded" />
                      <div className="h-3 w-full bg-slate-800/60 rounded" />
                    </div>
                    <div className="h-4 w-32 bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl bg-slate-900/30 p-12 text-center border border-dashed border-white/10 backdrop-blur-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-400 mx-auto mb-4 border border-white/5">
                  <Layers className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Tidak ada tugas ditemukan</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Coba sesuaikan filter atau kata kunci pencarian Anda.'
                    : 'Belum ada tugas dalam daftar. Klik tombol di bawah untuk membuat tugas pertama Anda.'}
                </p>
                <button
                  onClick={handleOpenNewTask}
                  className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Tugas Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 TaskFlow. Next.js 16 + Tailwind CSS + Neon Serverless PostgreSQL + Prisma ORM.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> Neon Cloud DB Connected
            </span>
            <span>Glassmorphism Dark UI</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        taskToEdit={taskToEdit}
      />

      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />
    </div>
  );
}
