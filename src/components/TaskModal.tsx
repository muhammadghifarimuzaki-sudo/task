'use client';

import React, { useState, useEffect } from 'react';
import { Task, Priority, Status } from '@/types';
import { X, Calendar, Tag, AlertCircle, Save } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  taskToEdit?: Task | null;
}

const predefinedCategories = [
  'Productivity',
  'Development',
  'DevOps',
  'Design',
  'Backend',
  'Frontend',
  'Meeting',
  'Research',
  'Personal',
];

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('pending');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || 'Productivity');
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);

      if (taskToEdit.deadline) {
        try {
          const d = new Date(taskToEdit.deadline);
          // format into YYYY-MM-DDTHH:mm for datetime-local
          setDeadline(format(d, "yyyy-MM-dd'T'HH:mm"));
        } catch {
          setDeadline('');
        }
      } else {
        setDeadline('');
      }
    } else {
      // Default new task
      setTitle('');
      setDescription('');
      setCategory('Productivity');
      setPriority('medium');
      setStatus('pending');
      // Default deadline: today at 18:00
      const now = new Date();
      now.setHours(18, 0, 0, 0);
      setDeadline(format(now, "yyyy-MM-dd'T'HH:mm"));
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || 'General',
        priority,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tugas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              {taskToEdit ? '✏️' : '✨'}
            </span>
            {taskToEdit ? 'Edit Tugas' : 'Buat Tugas Baru'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Judul */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Judul Tugas <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Selesaikan Laporan Keuangan Bulanan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={3}
              placeholder="Tambahkan detail informasi atau instruksi tugas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          {/* Kategori & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Kategori / Tag
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="categories-list"
                  placeholder="Pilih atau ketik kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <datalist id="categories-list">
                  {predefinedCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="low" className="bg-slate-900 text-emerald-400">
                  🟢 Low
                </option>
                <option value="medium" className="bg-slate-900 text-amber-400">
                  🟡 Medium
                </option>
                <option value="high" className="bg-slate-900 text-rose-400">
                  🔴 High
                </option>
              </select>
            </div>
          </div>

          {/* Deadline & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Deadline (Tanggal & Jam)
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="pending" className="bg-slate-900 text-slate-200">
                  ⏳ Pending (Belum Selesai)
                </option>
                <option value="completed" className="bg-slate-900 text-emerald-400">
                  ✅ Completed (Selesai)
                </option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Menyimpan...' : taskToEdit ? 'Perbarui Tugas' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
