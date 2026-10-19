import { useState } from 'react';
import { useEventStore } from '../store/eventStore';
import { CheckCircle2, Clock, Calendar, MapPin, Users, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { isUpdateColorActive, getEffectiveStatus } from '../utils/dateUtils';

export default function PublicPriority() {
  const { events, markStatus } = useEventStore();
  const [statusFilter, setStatusFilter] = useState('all');

  const sortedEvents = [...events].sort((a, b) => {
    const priorityOrder = { priority: 1, high: 1 };
    if ((priorityOrder[a.priority] || 2) !== (priorityOrder[b.priority] || 2)) {
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    }
    return new Date(a.tanggalMulai) - new Date(b.tanggalMulai);
  });

  const filteredEvents = sortedEvents.filter(e => {
    if (statusFilter === 'all') return true;
    return getEffectiveStatus(e) === statusFilter;
  });

  const getCardStyle = (status, event) => {
    const s = getEffectiveStatus(event);
    if (s === 'pending') {
      return 'bg-red-50/80 border-red-200 border-l-red-600 text-red-950 shadow-xs hover:border-red-300';
    }
    if (s === 'completed') {
      return 'bg-white border-slate-200 border-l-emerald-600 text-slate-900 shadow-xs hover:border-slate-300';
    }
    if (event?.priority === 'priority' || event?.priority === 'high') {
      return 'bg-orange-50/60 border-orange-200 border-l-[#FF4D00] text-slate-900 shadow-xs hover:border-orange-300';
    }
    if (s === 'new' || s === 'reschedule' || s === 'updated') {
      if (isUpdateColorActive(event)) {
        return 'bg-[#b7e1cd] border-[#86c7a8] border-l-emerald-600 text-slate-900 shadow-xs';
      }
      return 'bg-white border-slate-200 border-l-slate-400 text-slate-900 shadow-xs hover:border-slate-300';
    }
    return 'bg-white border-slate-200 border-l-slate-400 text-slate-900 shadow-xs hover:border-slate-300';
  };

  const renderStatusButton = (event) => {
    const s = getEffectiveStatus(event);

    if (s === 'completed') {
      return (
        <button
          onClick={() => markStatus(event.id, 'pending')}
          title="Klik untuk ubah ke PENDING"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-emerald-700 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <CheckCircle2 size={14} className="shrink-0 text-white" />
          <span>COMPLETED</span>
        </button>
      );
    }

    if (s === 'pending') {
      return (
        <button
          onClick={() => markStatus(event.id, 'completed')}
          title="Klik untuk ubah ke COMPLETED"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-700 transition-all cursor-pointer active:scale-95 shrink-0 animate-pulse-subtle"
        >
          <Clock size={14} className="shrink-0 text-white" />
          <span>PENDING</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => markStatus(event.id, 'completed')}
        title="Klik untuk tandai selesai"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[#FF4D00] hover:bg-[#e04400] text-white shadow-sm border border-[#cc3e00] transition-all cursor-pointer shrink-0"
      >
        <i className="bi bi-exclamation-triangle text-xs shrink-0 text-white"></i>
        <span>{(event.status || 'TERJADUAL').toUpperCase()}</span>
      </button>
    );
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-line p-4 sm:p-6 min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-ink m-0 uppercase tracking-wide flex items-center gap-2">
            <i className="bi bi-exclamation-triangle text-[#FF4D00]"></i>
            Prioritas Kegiatan
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Daftar kegiatan keselamatan berdasarkan tingkat prioritas dan status pelaksanaan
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'pending', label: '🔴 Pending', badgeBg: 'bg-red-100 text-red-700' },
            { id: 'completed', label: '🟢 Completed', badgeBg: 'bg-emerald-100 text-emerald-700' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${statusFilter === tab.id
                  ? 'bg-accent text-white border-accent shadow-xs'
                  : 'bg-bg text-ink-soft hover:bg-line/40 border-line'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Groups */}
      <div className="space-y-6 sm:space-y-8">
        {['priority'].map(priorityLevel => {
          const eventsInPriority = filteredEvents.filter(e => e.priority === 'priority' || e.priority === 'high');
          if (eventsInPriority.length === 0) return null;

          return (
            <div key={priorityLevel} className="mb-6 sm:mb-8">
              {/* Priority Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-xs bg-[#FF4D00] inline-flex items-center gap-1.5">
                  <i className="bi bi-exclamation-triangle"></i>
                  PRIORITY EVENT
                </span>
                <span className="text-xs font-bold text-ink-soft opacity-80">
                  ({eventsInPriority.length} kegiatan)
                </span>
              </div>

              {/* Cards List */}
              <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
                {eventsInPriority.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 sm:p-5 border rounded-xl border-l-4 transition-all duration-200 ${getCardStyle(event.status, event)}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 border-b border-black/5 pb-3">
                      <h4 className="text-base sm:text-lg font-extrabold text-ink m-0 tracking-tight">
                        {event.judul}
                      </h4>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {renderStatusButton(event)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs sm:text-sm text-ink/80 font-medium">
                      <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-black/5">
                        <Calendar size={15} className="text-accent shrink-0" />
                        <div>
                          <span className="font-bold text-ink block text-[11px] uppercase tracking-wider opacity-70">Waktu Pelaksanaan</span>
                          <span>{event.tanggalSelesai && event.tanggalSelesai !== event.tanggalMulai ? `${event.tanggalMulai} s/d ${event.tanggalSelesai}` : event.tanggalMulai} &middot; {event.waktuMulai || '08:00'} WIB</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-black/5">
                        <MapPin size={15} className="text-accent shrink-0" />
                        <div>
                          <span className="font-bold text-ink block text-[11px] uppercase tracking-wider opacity-70">Lokasi</span>
                          <span className="truncate block">{event.lokasi?.nama || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-black/5 sm:col-span-2 lg:col-span-1">
                        <Users size={15} className="text-accent shrink-0" />
                        <div>
                          <span className="font-bold text-ink block text-[11px] uppercase tracking-wider opacity-70">PIC Penanggung Jawab</span>
                          <span className="truncate block">{event.pic?.map(p => p.nama).join(', ') || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3.5 pt-3 border-t border-black/5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-ink-soft italic">
                        Klik tombol status di atas untuk mengubah status kegiatan
                      </span>
                      <div className="flex items-center gap-2">
                        {(event.status || '').toLowerCase() !== 'completed' && (
                          <button
                            onClick={() => markStatus(event.id, 'completed')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <Check size={12} /> Mark Completed
                          </button>
                        )}
                        {(event.status || '').toLowerCase() !== 'pending' && (
                          <button
                            onClick={() => markStatus(event.id, 'pending')}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <RefreshCw size={12} /> Mark Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-ink-soft bg-bg rounded-xl border border-dashed border-line">
            <p className="text-sm font-semibold">Tidak ada kegiatan dengan status yang dipilih.</p>
          </div>
        )}
      </div>
    </div>
  );
}

