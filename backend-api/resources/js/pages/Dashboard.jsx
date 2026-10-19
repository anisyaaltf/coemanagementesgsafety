import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import {
  Info,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  ChevronRight,
  Plus,
  MapPin,
  CalendarDays,
  AlertCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { isUpdateColorActive, getEffectiveStatus } from '../utils/dateUtils';
import EventDetailModal from '../components/event/EventDetailModal';
import EventFormModal from '../components/event/EventFormModal';

export default function Dashboard() {
  const { events, pics } = useEventStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, today, priority, pending, completed

  const todayStr = new Date().toISOString().split('T')[0];

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const kpiData = {
    total: events.length,
    hariIni: events.filter(e => e.tanggalMulai === todayStr).length,
    upcoming: events.filter(e => {
      const s = getEffectiveStatus(e);
      return s === 'new' || s === 'reschedule' || s === 'updated';
    }).length,
    pending: events.filter(e => getEffectiveStatus(e) === 'pending').length,
    completed: events.filter(e => getEffectiveStatus(e) === 'completed').length,
    highPriority: events.filter(e => e.priority === 'priority' || e.priority === 'high').length,
  };


  const getStatusColor = (event) => {
    const status = typeof event === 'object' ? getEffectiveStatus(event) : event;
    switch (status) {
      case 'new': return 'bg-new';
      case 'reschedule':
      case 'updated': return isUpdateColorActive(typeof event === 'object' ? event : { status: 'reschedule' }) ? 'bg-update' : 'bg-ink-soft';
      case 'pending': return 'bg-pending';
      case 'completed': return 'bg-ink-soft';
      default: return 'bg-line';
    }
  };

  const getStatusBadge = (event) => {
    const status = getEffectiveStatus(event);
    switch (status) {
      case 'new':
        return { label: 'New', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-new' };
      case 'reschedule':
      case 'updated':
        return { label: 'Reschedule', bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-update' };
      case 'pending':
        return { label: 'Pending', bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-pending' };
      case 'completed':
        return { label: 'Completed', bg: 'bg-slate-100 text-slate-700 border-slate-200/80', dot: 'bg-slate-500' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-600 border-slate-200/80', dot: 'bg-slate-400' };
    }
  };

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    let list = [...events];

    if (activeTab === 'today') {
      list = list.filter(e => e.tanggalMulai === todayStr);
    } else if (activeTab === 'priority') {
      list = list.filter(e => e.priority === 'priority' || e.priority === 'high');
    } else if (activeTab === 'pending') {
      list = list.filter(e => getEffectiveStatus(e) === 'pending');
    } else if (activeTab === 'completed') {
      list = list.filter(e => getEffectiveStatus(e) === 'completed');
    }

    // Sort: items closest to today or upcoming first
    return list.sort((a, b) => {
      const dateA = new Date(`${a.tanggalMulai}T${a.waktuMulai || '00:00'}`);
      const dateB = new Date(`${b.tanggalMulai}T${b.waktuMulai || '00:00'}`);
      return dateA - dateB;
    });
  }, [events, activeTab, todayStr]);

  const formatIndonesianDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner / Header */}
      <div className="bg-gradient-to-r from-[#0E1D2E] via-[#13283E] to-[#1c3552] rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Sistem Aktif
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Calendar size={13} className="text-amber-400" />
              {todayFormatted}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Dashboard Calender Of Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Monitoring Kegiatan ESG & Safety.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setEditingEvent(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-accent to-[#C97A1F] hover:from-[#c98320] hover:to-[#b06714] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={16} className="shrink-0 stroke-[2.5]" />
            <span>Tambah Event Baru</span>
          </button>
          <a
            href="/kalender"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
          >
            <Calendar size={15} />
            <span>Lihat Kalender</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Event */}
        <div className="bg-surface p-4 rounded-xl border border-line/80 shadow-xs card-hover flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Total Event</span>
            <div className="w-8 h-8 rounded-lg bg-navy-deep/10 text-navy-deep flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ink">{kpiData.total}</div>
            <div className="text-[11px] text-ink-soft mt-0.5 font-medium">Agenda terdata</div>
          </div>
        </div>

        {/* Event Hari Ini */}
        <div className="bg-surface p-4 rounded-xl border border-line/80 shadow-xs card-hover flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ink">{kpiData.hariIni}</div>
            <div className="text-[11px] text-ink-soft mt-0.5 font-medium">Jadwal hari ini</div>
          </div>
        </div>

        {/* Upcoming Event */}
        <div className="bg-surface p-4 rounded-xl border border-line/80 shadow-xs card-hover flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-new"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Upcoming</span>
            <div className="w-8 h-8 rounded-lg bg-new/15 text-new flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ink">{kpiData.upcoming}</div>
            <div className="text-[11px] text-ink-soft mt-0.5 font-medium">Siap dilaksanakan</div>
          </div>
        </div>

        {/* Pending Event */}
        <div className="bg-surface p-4 rounded-xl border border-line/80 shadow-xs card-hover flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-pending"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-pending uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-pending/15 text-pending flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-pending">{kpiData.pending}</div>
            <div className="text-[11px] text-pending/80 mt-0.5 font-medium">Perlu tindak lanjut</div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-surface p-4 rounded-xl border border-line/80 shadow-xs card-hover flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-ink-soft"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-ink-soft/15 text-ink-soft flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-ink">{kpiData.completed}</div>
            <div className="text-[11px] text-ink-soft mt-0.5 font-medium">Selesai terlaksana</div>
          </div>
        </div>

        {/* Priority Event */}
        <div className="bg-surface p-4 rounded-xl border border-[#FF4D00]/40 shadow-xs card-hover flex flex-col justify-between relative overflow-hidden group bg-orange-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4D00]"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#FF4D00] uppercase tracking-wider flex items-center gap-1">
              Prioritas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FF4D00]/15 text-[#FF4D00] flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#FF4D00]">{kpiData.highPriority}</div>
            <div className="text-[11px] text-[#FF4D00]/80 mt-0.5 font-semibold">Prioritas tinggi</div>
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Terdekat (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-2xl border border-line/80 shadow-xs p-5 sm:p-6">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line/60">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-ink tracking-tight">Event Terdekat</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-line/60 text-ink-soft">
                    {filteredEvents.length}
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-0.5">Daftar agenda keselamatan yang memerlukan perhatian dan tindak lanjut</p>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center gap-1 bg-bg p-1 rounded-xl border border-line/80 overflow-x-auto [&::-webkit-scrollbar]:hidden shrink-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'all'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                    }`}
                >
                  Semua ({events.length})
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'today'
                    ? 'bg-surface text-accent shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                    }`}
                >
                  Hari Ini ({kpiData.hariIni})
                </button>
                <button
                  onClick={() => setActiveTab('priority')}
                  className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'priority'
                    ? 'bg-[#FF4D00] text-white shadow-xs'
                    : 'text-ink-soft hover:text-[#FF4D00]'
                    }`}
                >
                  Prioritas ({kpiData.highPriority})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'pending'
                    ? 'bg-pending text-white shadow-xs'
                    : 'text-ink-soft hover:text-pending'
                    }`}
                >
                  Pending ({kpiData.pending})
                </button>
              </div>
            </div>

            {/* Event List */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 px-4 bg-bg/50 rounded-xl border border-dashed border-line/80 my-4">
                <div className="w-12 h-12 rounded-full bg-line/50 text-ink-soft flex items-center justify-center mx-auto mb-3">
                  <Calendar size={22} />
                </div>
                <h3 className="text-sm font-bold text-ink">Tidak ada event untuk filter ini</h3>
                <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto">
                  Belum ada agenda pada kategori ini atau seluruh kegiatan telah diselesaikan.
                </p>
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setIsFormOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={14} /> Buat Event Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {filteredEvents.slice(0, 6).map((event) => {
                  const statusBadge = getStatusBadge(event);
                  const isHighPriority = event.priority === 'priority' || event.priority === 'high';

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-line/80 hover:border-accent/50 bg-surface hover:bg-bg/40 hover:shadow-md transition-all duration-200 cursor-pointer relative"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Status Dot with Glow */}
                        <div className="mt-1 shrink-0">
                          <span
                            className={`w-3.5 h-3.5 rounded-full ${getStatusColor(event)} block ring-4 ring-white shadow-xs`}
                            title={`Status: ${statusBadge.label}`}
                          />
                        </div>

                        {/* Event Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-ink text-sm sm:text-base group-hover:text-accent transition-colors truncate">
                              {event.judul}
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusBadge.bg}`}>
                              {statusBadge.label}
                            </span>
                          </div>

                          <div className="text-xs text-ink-soft mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-ink-soft/80" />
                              {event.tanggalSelesai && event.tanggalSelesai !== event.tanggalMulai
                                ? `${formatIndonesianDate(event.tanggalMulai)} - ${formatIndonesianDate(event.tanggalSelesai)}`
                                : formatIndonesianDate(event.tanggalMulai)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} className="text-ink-soft/80" />
                              {event.waktuMulai ? `${event.waktuMulai} WIB` : 'Fleksibel'}
                            </span>
                            {event.lokasi && (typeof event.lokasi === 'string' ? event.lokasi : event.lokasi.nama) && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 truncate max-w-[160px]">
                                  <MapPin size={13} className="text-ink-soft/80 shrink-0" />
                                  <span className="truncate">
                                    {typeof event.lokasi === 'object' ? event.lokasi.nama : event.lokasi}
                                  </span>
                                </span>
                              </>
                            )}
                            {event.penyelenggara && (
                              <>
                                <span>•</span>
                                <span className="text-accent font-medium truncate max-w-[160px]">
                                  {event.penyelenggara}
                                </span>
                              </>
                            )}
                            {event.notulensi && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                                <FileText size={11} /> Notulensi Ada
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-ink-soft mt-1.5 flex items-center gap-1.5">
                            <Users size={12} className="text-ink-soft/80" />
                            <span>PIC:</span>
                            <span className="font-semibold text-ink">
                              {event.pic && event.pic.length > 0
                                ? event.pic.map((p) => p.nama).join(', ')
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Priority Badge & Chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/40">
                        {isHighPriority ? (
                          <span className="text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-[#FF4D00]/15 text-[#FF4D00] border border-[#FF4D00]/30 shadow-xs">
                            <AlertTriangle size={12} />
                            PRIORITAS
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider inline-block bg-line/40 text-ink-soft border border-line">
                            STANDARD
                          </span>
                        )}
                        <div className="w-7 h-7 rounded-full bg-bg group-hover:bg-accent/10 text-ink-soft group-hover:text-accent flex items-center justify-center transition-colors">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer View All Link */}
            <div className="mt-5 pt-4 border-t border-line/60 flex items-center justify-between text-xs">
              <span className="text-ink-soft">
                Menampilkan <strong className="text-ink">{Math.min(filteredEvents.length, 6)}</strong> dari{' '}
                <strong className="text-ink">{filteredEvents.length}</strong> kegiatan
              </span>
              <a
                href="/kalender"
                className="font-bold text-accent hover:text-[#b06714] flex items-center gap-1 transition-colors"
              >
                Lihat Semua di Kalender <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Ringkasan Progres & Safety Status (1 Col) */}
        <div className="space-y-6">

          {/* Tim Safety & PIC On-Duty */}
          <div className="bg-surface rounded-2xl border border-line/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-navy-deep/10 text-navy-deep rounded-lg">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">ESG DAN SAFETY (PIC)</h3>

                </div>
              </div>
              <a
                href="/pic"
                className="text-xs font-bold text-accent hover:text-[#b06714] flex items-center gap-0.5"
              >
                Kelola <ChevronRight size={14} />
              </a>
            </div>

            <div className="mt-3 divide-y divide-line/40">
              {pics && pics.length > 0 ? (
                pics.slice(0, 4).map((pic) => (
                  <div key={pic.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-black text-xs flex items-center justify-center shrink-0">
                        {pic.nama?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-ink truncate">{pic.nama}</div>
                        <div className="text-[10px] text-ink-soft truncate">{pic.departemen || 'General Safety'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Aktif
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-ink-soft">Belum ada data PIC.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Panduan Indikator Warna Status Event (Full 5 Columns, No Holes!) */}
      <div className="bg-surface rounded-2xl border border-line/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4 border-b border-line/60 pb-3">
          <div className="p-1.5 bg-accent/10 text-accent rounded-lg">
            <Info size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight">
              Keterangan Indikator Warna Status Event
            </h2>
            <p className="text-xs text-ink-soft">Panduan warna indikator status kegiatan dalam sistem operasional keselamatan</p>
          </div>
        </div>

        {/* 5 Equal Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
          {/* 1. Hijau (NEW) */}
          <div className="p-3.5 bg-bg/60 border border-line/80 rounded-xl card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full bg-new shadow-xs ring-2 ring-new/20 shrink-0"></span>
                <span className="font-extrabold text-ink text-sm">Hijau (NEW)</span>
              </div>
              <p className="text-ink-soft text-xs leading-relaxed">
                Event baru yang telah terdaftar dan siap dilaksanakan sesuai jadwal.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-line/40 text-[10px] font-semibold text-emerald-700">
              Status: Baru
            </div>
          </div>

          {/* 2. Kuning/Amber (RESCHEDULE) */}
          <div className="p-3.5 bg-bg/60 border border-line/80 rounded-xl card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full bg-update shadow-xs ring-2 ring-update/20 shrink-0"></span>
                <span className="font-extrabold text-ink text-sm">Kuning (RESCHEDULE)</span>
              </div>
              <p className="text-ink-soft text-xs leading-relaxed">
                Event yang mengalami penyesuaian atau perubahan jadwal waktu/lokasi.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-line/40 text-[10px] font-semibold text-amber-700">
              Status: Jadwal Diubah
            </div>
          </div>

          {/* 3. Orange (PRIORITAS) */}
          <div className="p-3.5 bg-orange-50/40 border border-[#FF4D00]/30 rounded-xl card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF4D00] shadow-xs ring-2 ring-[#FF4D00]/25 shrink-0"></span>
                <span className="font-extrabold text-[#FF4D00] text-sm flex items-center gap-1">
                  <AlertTriangle size={13} /> Orange (PRIORITAS)
                </span>
              </div>
              <p className="text-ink-soft text-xs leading-relaxed">
                Kegiatan berstatus Priority (#FF4D00) dengan perhatian dan urgensi khusus.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#FF4D00]/20 text-[10px] font-bold text-[#FF4D00]">
              Status: Prioritas Tinggi
            </div>
          </div>

          {/* 4. Merah (PENDING) */}
          <div className="p-3.5 bg-bg/60 border border-line/80 rounded-xl card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full bg-pending shadow-xs ring-2 ring-pending/20 shrink-0"></span>
                <span className="font-extrabold text-pending text-sm">Merah (PENDING)</span>
              </div>
              <p className="text-ink-soft text-xs leading-relaxed">
                Event tertunda atau melewati jam selesai tanpa konfirmasi completed.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-line/40 text-[10px] font-semibold text-pending">
              Status: Tertunda / Perlu Tindakan
            </div>
          </div>

          {/* 5. Abu-abu (COMPLETED) */}
          <div className="p-3.5 bg-bg/60 border border-line/80 rounded-xl card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full bg-ink-soft shadow-xs ring-2 ring-ink-soft/20 shrink-0"></span>
                <span className="font-extrabold text-ink text-sm">Abu-abu (COMPLETED)</span>
              </div>
              <p className="text-ink-soft text-xs leading-relaxed">
                Event yang telah selesai dilaksanakan secara penuh beserta notulensi (✓).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-line/40 text-[10px] font-semibold text-ink-soft">
              Status: Selesai Penuh
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(eventToEdit) => {
            setSelectedEvent(null);
            setEditingEvent(eventToEdit);
            setIsFormOpen(true);
          }}
        />
      )}

      {isFormOpen && (
        <EventFormModal
          initialData={editingEvent}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}
