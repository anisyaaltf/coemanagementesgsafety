@extends('layouts.app')

@section('title', 'Pusat Notifikasi & Reminder - ESG & Safety COE')
@section('page_title', 'Pusat Notifikasi & Otomatisasi Reminder')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Header Banner & Info Jadwal Otomatis -->
    <div class="bg-gradient-to-r from-[#091523] via-[#0E1D2E] to-[#162a42] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider">
                    <span class="w-2 h-2 rounded-full bg-accent animate-ping"></span>
                    Sistem Pengingat Otomatis Aktif
                </div>
                <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">Jadwal Pengiriman Notifikasi Email PIC</h1>
                <p class="text-gray-300 text-sm max-w-2xl leading-relaxed">
                    Sistem secara otomatis mengirimkan email pengingat kepada PIC terdaftar sesuai pengaturan reminder pada masing-masing kegiatan:
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div class="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                        <span class="text-lg">✨</span>
                        <div>
                            <span class="font-bold text-emerald-400">Instan Saat Input Kegiatan</span>
                            <p class="text-gray-300 text-[11px]">Email langsung terkirim ke PIC begitu event baru disimpan.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                        <span class="text-lg">⏰</span>
                        <div>
                            <span class="font-bold text-accent">Jam 07:00 Pagi (WIB)</span>
                            <p class="text-gray-300 text-[11px]">Pengiriman harian untuk H-7, H-3, H-1, dan Hari H pagi.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                        <span class="text-lg">⏱</span>
                        <div>
                            <span class="font-bold text-amber-400">H-1 Jam Sebelum Acara</span>
                            <p class="text-gray-300 text-[11px]">Pengiriman pengingat 60 menit sebelum waktu mulai.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Button & Trigger -->
            <div class="shrink-0 flex flex-col gap-2.5">
                <button id="btn-trigger-reminders" onclick="openTriggerModal()"
                    class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-accent to-amber-500 hover:from-accent-hover hover:to-amber-600 text-ink shadow-lg shadow-accent/25 transition-all transform active:scale-95 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>Jalankan Reminder Sekarang</span>
                </button>
                <span class="text-[11px] text-gray-400 text-center">Pengecekan otomatis berjalan via Scheduler & Cron</span>
            </div>
        </div>
    </div>

    <!-- Stats Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div class="bg-surface border border-line rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
                <p class="text-xs font-semibold text-ink-soft uppercase tracking-wider">Total Email Terkirim</p>
                <h3 class="text-2xl font-black text-ink mt-0.5">{{ number_format($totalSent) }}</h3>
                <span class="text-[11px] text-emerald-600 font-medium">Berhasil terkirim via Email Notifikasi</span>
            </div>
        </div>

        <div class="bg-surface border border-line rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
                <p class="text-xs font-semibold text-ink-soft uppercase tracking-wider">Terkirim Hari Ini</p>
                <h3 class="text-2xl font-black text-ink mt-0.5">{{ number_format($todaySent) }}</h3>
                <span class="text-[11px] text-ink-soft">Tanggal {{ \Carbon\Carbon::now(config('app.timezone', 'Asia/Jakarta'))->translatedFormat('d F Y') }}</span>
            </div>
        </div>

        <div class="bg-surface border border-line rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
                <p class="text-xs font-semibold text-ink-soft uppercase tracking-wider">Pengiriman Gagal</p>
                <h3 class="text-2xl font-black text-ink mt-0.5">{{ number_format($totalFailed) }}</h3>
                <span class="text-[11px] text-ink-soft">Tercatat di reminder log</span>
            </div>
        </div>
    </div>

    <!-- Table: Riwayat Log Pengiriman Reminder -->
    <div class="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div class="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 class="text-base font-bold text-ink flex items-center gap-2">
                    <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    Riwayat Pengiriman Reminder Email PIC
                </h2>
                <p class="text-xs text-ink-soft">Daftar pengiriman email reminder pengingat kegiatan kepada PIC</p>
            </div>
            <button onclick="window.location.reload()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink-soft hover:text-ink hover:bg-bg transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Muat Ulang</span>
            </button>
        </div>

        @if($logs->isEmpty())
            <div class="p-12 text-center text-ink-soft space-y-3">
                <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                </div>
                <h4 class="text-sm font-bold text-ink">Belum Ada Riwayat Reminder</h4>
                <p class="text-xs max-w-md mx-auto">Reminder akan tercatat secara otomatis saat scheduler jam 07:00 pagi atau pengecekan H-1 jam berjalan.</p>
                <div class="pt-2">
                    <button onclick="openTriggerModal()" class="px-4 py-2 bg-accent/10 text-accent font-semibold rounded-lg text-xs hover:bg-accent/20 transition-colors">
                        Jalankan Pengujian Manual
                    </button>
                </div>
            </div>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr class="bg-bg text-ink-soft uppercase text-[11px] font-bold border-b border-line">
                            <th class="py-3 px-4">Waktu Kirim</th>
                            <th class="py-3 px-4">Nama Kegiatan</th>
                            <th class="py-3 px-4">Jenis Reminder</th>
                            <th class="py-3 px-4">Penerima (PIC)</th>
                            <th class="py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-line">
                        @foreach($logs as $log)
                            <tr class="hover:bg-bg/50 transition-colors">
                                <td class="py-3 px-4 text-ink-soft whitespace-nowrap text-xs">
                                    <div class="font-medium text-ink">{{ $log->sent_at ? $log->sent_at->setTimezone(config('app.timezone', 'Asia/Jakarta'))->translatedFormat('d M Y, H:i') . ' WIB' : '-' }}</div>
                                    <div class="text-[11px] text-ink-soft">{{ $log->sent_at ? $log->sent_at->setTimezone(config('app.timezone', 'Asia/Jakarta'))->diffForHumans() : '' }}</div>
                                </td>
                                <td class="py-3 px-4 font-semibold text-ink">
                                    {{ $log->event->judul ?? "Kegiatan #{$log->event_id}" }}
                                    @if($log->event && $log->event->waktu_mulai)
                                        <div class="text-[11px] font-normal text-ink-soft">
                                            Mulai: {{ substr($log->event->waktu_mulai, 0, 5) }} WIB
                                        </div>
                                    @endif
                                </td>
                                <td class="py-3 px-4 whitespace-nowrap">
                                    @php
                                        $type = $log->reminder_type;
                                        $badgeClass = match($type) {
                                            'H-1 Jam' => 'bg-orange-100 text-orange-800 border-orange-300 font-bold',
                                            'Hari H' => 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
                                            'H-1' => 'bg-blue-100 text-blue-800 border-blue-300',
                                            'H-3' => 'bg-indigo-100 text-indigo-800 border-indigo-300',
                                            'H-7' => 'bg-purple-100 text-purple-800 border-purple-300',
                                            default => 'bg-gray-100 text-gray-800 border-gray-300'
                                        };
                                    @endphp
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border {{ $badgeClass }}">
                                        @if($type === 'H-1 Jam')
                                            ⏱ {{ $type }}
                                        @elseif($type === 'Hari H')
                                            📅 {{ $type }} (Pagi)
                                        @else
                                            ⏳ {{ $type }}
                                        @endif
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <div class="font-medium text-ink">{{ $log->recipient_name ?: ($log->pic->nama ?? 'PIC') }}</div>
                                    <div class="text-xs text-ink-soft">{{ $log->recipient_email }}</div>
                                </td>
                                <td class="py-3 px-4 whitespace-nowrap">
                                    @if($log->status === 'sent')
                                        <span class="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                            Terkirim
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-xs font-semibold" title="{{ $log->error_message }}">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                            Gagal
                                        </span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</div>

<!-- Modal Trigger Manual -->
<div id="trigger-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-surface w-full max-w-lg rounded-2xl border border-line shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-line pb-3">
            <h3 class="font-bold text-base text-ink flex items-center gap-2">
                <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Jalankan Pemeriksaan Reminder
            </h3>
            <button onclick="closeTriggerModal()" class="text-ink-soft hover:text-ink p-1 rounded-lg">✕</button>
        </div>

        <div class="space-y-3 text-xs sm:text-sm">
            <div>
                <label class="block text-xs font-semibold text-ink mb-1">Tipe Pengecekan</label>
                <select id="modal-type" class="w-full px-3 py-2 border border-line rounded-lg bg-bg text-ink text-sm">
                    <option value="all">Semua (Jadwal Harian 07:00 & H-1 Jam)</option>
                    <option value="daily">Harian Jam 07:00 Pagi (H-7, H-3, H-1, Hari H)</option>
                    <option value="hourly">H-1 Jam Hari H (Kegiatan dalam 1 jam ke depan)</option>
                </select>
            </div>

            <div>
                <label class="block text-xs font-semibold text-ink mb-1">Override Email Penerima (Opsional / Testing)</label>
                <input type="email" id="modal-to" placeholder="kosongkan untuk kirim ke email asli PIC"
                    class="w-full px-3 py-2 border border-line rounded-lg bg-bg text-ink text-sm" />
                <span class="text-[11px] text-ink-soft">Jika diisi, semua email reminder akan dialihkan ke alamat ini.</span>
            </div>

            <div class="flex items-center gap-2 pt-1">
                <input type="checkbox" id="modal-force" class="rounded border-line text-accent w-4 h-4 cursor-pointer" />
                <label for="modal-force" class="text-xs font-medium text-ink cursor-pointer">
                    Paksa kirim (Abaikan log riwayat kirim hari ini / Force send)
                </label>
            </div>
        </div>

        <!-- Progress / Result output box -->
        <div id="trigger-output-box" class="hidden p-3 rounded-xl bg-bg border border-line text-xs font-mono text-ink max-h-48 overflow-y-auto whitespace-pre-wrap"></div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button onclick="closeTriggerModal()" class="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink rounded-lg">Batal</button>
            <button id="btn-modal-submit" onclick="executeTrigger()"
                class="px-5 py-2 text-xs font-bold bg-accent hover:bg-accent-hover text-ink rounded-lg shadow-sm flex items-center gap-2 cursor-pointer">
                <span>Eksekusi Sekarang</span>
            </button>
        </div>
    </div>
</div>

<script>
    function openTriggerModal() {
        document.getElementById('trigger-modal').classList.remove('hidden');
        document.getElementById('trigger-output-box').classList.add('hidden');
        document.getElementById('trigger-output-box').innerText = '';
    }

    function closeTriggerModal() {
        document.getElementById('trigger-modal').classList.add('hidden');
    }

    async function executeTrigger() {
        const btn = document.getElementById('btn-modal-submit');
        const outputBox = document.getElementById('trigger-output-box');
        const type = document.getElementById('modal-type').value;
        const to = document.getElementById('modal-to').value.trim();
        const force = document.getElementById('modal-force').checked;

        btn.disabled = true;
        btn.innerHTML = `<span class="inline-block animate-spin mr-1">⌛</span> Memproses...`;
        outputBox.classList.remove('hidden');
        outputBox.innerText = 'Menghubungi server dan memproses reminder...';

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/reminders/trigger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({ type, to, force })
            });

            const data = await res.json();
            if (res.ok) {
                outputBox.innerText = data.output || data.message || 'Selesai dijalankan.';
                btn.innerHTML = '✓ Selesai';
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                outputBox.innerText = 'Error: ' + (data.message || 'Gagal memproses');
                btn.disabled = false;
                btn.innerHTML = 'Coba Lagi';
            }
        } catch (e) {
            outputBox.innerText = 'Network error: ' + e.message;
            btn.disabled = false;
            btn.innerHTML = 'Coba Lagi';
        }
    }
</script>
@endsection
