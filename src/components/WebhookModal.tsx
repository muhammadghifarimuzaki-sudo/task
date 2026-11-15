'use client';

import React, { useState, useEffect } from 'react';
import { WebhookConfig } from '@/types';
import {
  X,
  Send,
  Save,
  CheckCircle2,
  XCircle,
  Code2,
  BellRing,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebhookModal({ isOpen, onClose }: WebhookModalProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('Telegram / n8n Webhook');
  const [active, setActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    payload?: any;
    statusCode?: number;
  } | null>(null);

  // Load existing webhook config
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setTestResult(null);
      fetch('/api/webhook')
        .then((res) => res.json())
        .then((data: WebhookConfig) => {
          if (data && data.url) {
            setUrl(data.url);
            setName(data.name || 'Telegram / n8n Webhook');
            setActive(data.active !== undefined ? data.active : true);
          }
        })
        .catch((err) => console.error('Error fetching webhook:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), name: name.trim(), active }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan webhook');
      setTestResult({
        success: true,
        message: 'Pengaturan webhook berhasil disimpan ke database!',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menyimpan konfigurasi.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Webhook terlebih dahulu untuk menguji.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      setTestResult({
        success: data.success,
        statusCode: data.statusCode,
        message: data.message || data.error || 'Uji coba selesai.',
        payload: data.payload,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Integrasi Webhook</h2>
              <p className="text-xs text-slate-400">
                Kirim notifikasi otomatis ke Telegram, n8n, Zapier, atau Discord
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nama Endpoint Webhook
            </label>
            <input
              type="text"
              placeholder="Contoh: Notifikasi Bot Telegram Tim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              URL Webhook Target (HTTP POST) <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage atau https://n8n.instance/webhook/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-white/5">
            <div>
              <span className="text-sm font-semibold text-slate-200">
                Aktifkan Pengiriman Otomatis
              </span>
              <p className="text-xs text-slate-400">
                Kirim payload JSON setiap kali ada tugas baru dibuat.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Test Result Feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.statusCode && (
                  <p className="text-[11px] opacity-80 mt-0.5">
                    HTTP Response Code: {testResult.statusCode}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* JSON Payload Sample */}
          <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-indigo-400" />
                Format Payload JSON yang Dikirim
              </span>
              <span className="text-[10px] text-slate-500">application/json</span>
            </div>
            <pre className="text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-36 p-2 rounded bg-slate-900/60 border border-white/5">
{JSON.stringify(
  {
    event: 'test_notification',
    source: 'TaskFlow Productivity Tracker',
    timestamp: '2026-11-15T12:00:00.000Z',
    summary: { totalTasks: 5, completedTasks: 1, pendingTasks: 4 },
    message: 'Halo! Uji coba integrasi webhook TaskFlow.',
  },
  null,
  2
)}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !url}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mengirim Uji Coba...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Test Notification
                </>
              )}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? 'Menyimpan...' : 'Simpan Webhook'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
