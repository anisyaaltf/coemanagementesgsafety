import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import idLocale from '@fullcalendar/core/locales/id';
import { Plus, Search, Filter, Check, MapPin, User, FileText, Clock, Calendar } from 'lucide-react';
import { useEventStore } from '../../store/eventStore';
import EventDetailModal from '../../components/event/EventDetailModal';
import EventFormModal from '../../components/event/EventFormModal';

import { isUpdateColorActive, getEffectiveStatus, getDatesInRange } from '../../utils/dateUtils';

function RescheduleIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Badan Kalender */}
      <rect x="2" y="4" width="19" height="15" rx="2" fill="currentColor" />
      {/* Celah Putih & Pin Kalender Atas (4 Pin) */}
      <rect x="3.8" y="3.5" width="3.4" height="3.2" rx="1" fill="#ffffff" />
      <rect x="4.5" y="1.5" width="2" height="4.2" rx="0.7" fill="currentColor" />
      <rect x="8.1" y="3.5" width="3.4" height="3.2" rx="1" fill="#ffffff" />
      <rect x="8.8" y="1.5" width="2" height="4.2" rx="0.7" fill="currentColor" />
      <rect x="12.5" y="3.5" width="3.4" height="3.2" rx="1" fill="#ffffff" />
      <rect x="13.2" y="1.5" width="2" height="4.2" rx="0.7" fill="currentColor" />
      <rect x="16.8" y="3.5" width="3.4" height="3.2" rx="1" fill="#ffffff" />
      <rect x="17.5" y="1.5" width="2" height="4.2" rx="0.7" fill="currentColor" />
      {/* Kotak Tanggal Baris 1 (3 Kotak) */}
      <rect x="4.2" y="8.2" width="3.6" height="3" rx="0.5" fill="currentColor" stroke="#ffffff" strokeWidth="1.2" />
      <rect x="9.7" y="8.2" width="3.6" height="3" rx="0.5" fill="currentColor" stroke="#ffffff" strokeWidth="1.2" />
      <rect x="15.2" y="8.2" width="3.6" height="3" rx="0.5" fill="currentColor" stroke="#ffffff" strokeWidth="1.2" />
      {/* Kotak Tanggal Baris 2 (2 Kotak) */}
      <rect x="4.2" y="13" width="3.6" height="3" rx="0.5" fill="currentColor" stroke="#ffffff" strokeWidth="1.2" />
      <rect x="9.7" y="13" width="3.6" height="3" rx="0.5" fill="currentColor" stroke="#ffffff" strokeWidth="1.2" />
      {/* Jam di Pojok Kanan Bawah */}
      <circle cx="17.5" cy="17.5" r="5.8" fill="#ffffff" />
      <circle cx="17.5" cy="17.5" r="4.8" fill="currentColor" />
      <path
        d="M17.5 14.6V17.6L19.6 19.5"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CalendarPage() {
  const { events } = useEventStore();
  const calendarRef = useRef(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter events
  const filteredEvents = events.filter((event) => {
    const lokasiText = event.lokasi && event.lokasi.nama ? event.lokasi.nama.toLowerCase() : '';
    const picMatch = Array.isArray(event.pic) && event.pic.some(p => p.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSearch =
      event.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lokasiText.includes(searchQuery.toLowerCase()) ||
      picMatch;

    const effStatus = getEffectiveStatus(event);
    const matchesStatus = statusFilter === 'all' || effStatus === statusFilter;
    const matchesPriority = priorityFilter === 'all'
      ? true
      : priorityFilter === 'priority'
      ? (event.priority === 'priority' || event.priority === 'high')
      : (event.priority === 'standard');

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 1. Kelompokkan kegiatan berdasarkan judul & tanggal untuk mendeteksi kegiatan multi-hari/berulang
  const titleDateMap = {};
  filteredEvents.forEach((ev) => {
    const cleanTitle = (ev.judul || '').trim().toLowerCase();
    if (!cleanTitle) return;
    if (!titleDateMap[cleanTitle]) {
      titleDateMap[cleanTitle] = new Set();
    }
    const dates = getDatesInRange(ev.tanggalMulai, ev.tanggalSelesai);
    dates.forEach((d) => titleDateMap[cleanTitle].add(d));
  });

  // 2. Kumpulkan seluruh seri multi-hari / kegiatan berulang agar posisinya stabil & sejajar (row slot terkunci)
  const seriesList = [];
  const seenCleanTitles = new Set();

  filteredEvents.forEach((ev) => {
    const cleanTitle = (ev.judul || '').trim().toLowerCase();
    if (!cleanTitle || seenCleanTitles.has(cleanTitle)) return;

    const distinctDates = titleDateMap[cleanTitle] ? titleDateMap[cleanTitle].size : 1;
    const dates = getDatesInRange(ev.tanggalMulai, ev.tanggalSelesai);
    const isMultiDaySpan = dates.length > 1 || distinctDates > 1;

    if (isMultiDaySpan) {
      seenCleanTitles.add(cleanTitle);

      const matchingEvents = filteredEvents.filter(
        (e) => (e.judul || '').trim().toLowerCase() === cleanTitle
      );

      let earliestStart = ev.tanggalMulai || '9999-99-99';
      let latestEnd = ev.tanggalSelesai || ev.tanggalMulai || '0000-00-00';
      let hasPriority = false;

      matchingEvents.forEach((me) => {
        if (me.tanggalMulai && me.tanggalMulai < earliestStart) earliestStart = me.tanggalMulai;
        const end = me.tanggalSelesai || me.tanggalMulai;
        if (end && end > latestEnd) latestEnd = end;
        if (me.priority === 'priority' || me.priority === 'high') hasPriority = true;
      });

      seriesList.push({
        cleanTitle,
        earliestStart,
        latestEnd,
        totalDays: distinctDates,
        hasPriority,
      });
    }
  });

  // Urutkan seri multi-hari secara deterministik:
  // - Prioritas utama di paling atas
  // - Kegiatan yang mulai lebih awal konsisten di slot baris teratas (Row 1, 2, dst)
  // - Durasi lebih panjang diutamakan
  seriesList.sort((a, b) => {
    if (a.hasPriority !== b.hasPriority) return a.hasPriority ? -1 : 1;
    if (a.earliestStart !== b.earliestStart) return a.earliestStart.localeCompare(b.earliestStart);
    if (a.totalDays !== b.totalDays) return b.totalDays - a.totalDays;
    return a.cleanTitle.localeCompare(b.cleanTitle);
  });

  // Peta ranking slot baris: 1, 2, 3... untuk kegiatan multi-hari
  const seriesOrderMap = {};
  seriesList.forEach((s, idx) => {
    seriesOrderMap[s.cleanTitle] = idx + 1;
  });

  // Map to FullCalendar
  const mappedEvents = filteredEvents.flatMap((event) => {
    const status = getEffectiveStatus(event);
    const isCompleted = status === 'completed';
    const isPriority = event.priority === 'priority' || event.priority === 'high';
    let backgroundColor = '#ffffff';
    let borderColor = '#cbd5e1';
    let textColor = '#1e293b';

    if (isCompleted) {
      backgroundColor = '#ffffff'; // Original white card
      borderColor = '#cbd5e1';
      textColor = '#1e293b';
    } else if (isPriority) {
      // Kegiatan prioritas berwarna oranye #FF4D00
      backgroundColor = '#FF4D00';
      borderColor = '#e04400';
      textColor = '#ffffff';
    } else if (status === 'pending') {
      // Warna merah HANYA untuk kegiatan pending saja
      backgroundColor = '#dc2626';
      borderColor = '#b91c1c';
      textColor = '#ffffff';
    } else if (status === 'new' || status === 'reschedule' || status === 'updated') {
      const active = isUpdateColorActive(event);
      backgroundColor = active ? '#b7e1cd' : '#ffffff';
      borderColor = active ? '#86c7a8' : '#cbd5e1';
      textColor = '#1e293b';
    }

    const cleanTitle = (event.judul || '').trim().toLowerCase();
    const isSeriesMultiDay = seriesOrderMap[cleanTitle] !== undefined;

    // Tentukan order value:
    // Kegiatan multi-hari / nama sama mendapatkan slot 1..99 sehingga selalu di baris atas dan sejajar
    // Kegiatan satu hari (single-day) mendapatkan slot 100+ sehingga tersusun rapi di bawahnya
    let orderValue = 999;
    if (isSeriesMultiDay) {
      orderValue = seriesOrderMap[cleanTitle];
    } else {
      orderValue = isPriority ? 100 : 200;
    }

    const dates = getDatesInRange(event.tanggalMulai, event.tanggalSelesai);
    const isMultiDay = dates.length > 1;

    // Single day event
    if (!isMultiDay) {
      return [{
        id: event.id ? event.id.toString() : `ev_${Date.now()}`,
        title: event.judul,
        order: orderValue,
        start: event.waktuMulai ? `${event.tanggalMulai}T${event.waktuMulai}:00` : event.tanggalMulai,
        end: event.waktuSelesai ? `${event.tanggalMulai}T${event.waktuSelesai}:00` : event.tanggalMulai,
        backgroundColor,
        borderColor,
        textColor,
        display: 'block',
        extendedProps: {
          ...event,
          originalEventId: event.id ? event.id.toString() : '',
          status,
          isPriority,
          isMultiDay: isSeriesMultiDay,
          order: orderValue,
          waktuMulai: event.waktuMulai || ''
        }
      }];
    }

    // Kegiatan multi-hari: dipetakan rapi per hari dengan order yang konsisten sehingga sejajar secara horizontal
    return dates.map((dateStr, idx) => ({
      id: `${event.id}_day_${dateStr}`,
      title: event.judul,
      order: orderValue,
      start: event.waktuMulai ? `${dateStr}T${event.waktuMulai}:00` : dateStr,
      end: event.waktuSelesai ? `${dateStr}T${event.waktuSelesai}:00` : dateStr,
      backgroundColor,
      borderColor,
      textColor,
      display: 'block',
      extendedProps: {
        ...event,
        originalEventId: event.id ? event.id.toString() : '',
        status,
        isPriority,
        isMultiDay: true,
        order: orderValue,
        waktuMulai: event.waktuMulai || '',
        currentDayIndex: idx + 1,
        totalDays: Math.max(dates.length, titleDateMap[cleanTitle]?.size || 1),
        currentDateStr: dateStr
      }
    }));
  });

  const handleEventClick = (info) => {
    const rawId = info.event.extendedProps.originalEventId || info.event.id;
    const foundEvent = events.find((e) => e.id?.toString() === rawId?.toString());
    if (foundEvent) {
      setSelectedEvent(foundEvent);
    }
  };

  const handleDateClick = (arg) => {
    setEditingEvent({
      tanggalMulai: arg.dateStr,
      tanggalSelesai: arg.dateStr,
    });
    setIsFormOpen(true);
  };

  const renderEventContent = (eventInfo) => {
    const { title, extendedProps } = eventInfo.event;
    const isListView = eventInfo.view.type.startsWith('list');
    const status = getEffectiveStatus(extendedProps);
    const isCompleted = status === 'completed';
    const isPriority = extendedProps.priority === 'priority' || extendedProps.priority === 'high';
    const isReschedule = status === 'reschedule' || status === 'updated';
    const isMultiDay = extendedProps.isMultiDay;
    const currentDayIndex = extendedProps.currentDayIndex;
    const totalDays = extendedProps.totalDays;

    // Format Waktu
    const startWaktu = extendedProps.waktuMulai ? extendedProps.waktuMulai.substring(0, 5) : '';
    const endWaktu = extendedProps.waktuSelesai ? extendedProps.waktuSelesai.substring(0, 5) : '';
    const timeDisplay = startWaktu ? (endWaktu ? `${startWaktu} - ${endWaktu}` : startWaktu) : '';

    // Format Lokasi
    const lokasiNama = typeof extendedProps.lokasi === 'object' && extendedProps.lokasi !== null
      ? extendedProps.lokasi.nama
      : (extendedProps.lokasi || '');

    // Format PIC
    const picNames = Array.isArray(extendedProps.pic) && extendedProps.pic.length > 0
      ? extendedProps.pic.map(p => p.nama).filter(Boolean).join(', ')
      : (extendedProps.pic_nama || '');

    if (isListView) {
      return (
        <div className="py-2 cursor-pointer text-ink flex items-center justify-between w-full">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm sm:text-base text-ink mb-1 flex items-center gap-2 flex-wrap">
              <span className="truncate">{title}</span>
              {isMultiDay && (
                <span
                  title={`Jadwal Multi-Hari: Hari ke-${currentDayIndex} dari ${totalDays} hari (${extendedProps.tanggalMulai} s/d ${extendedProps.tanggalSelesai})`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full shrink-0"
                >
                  <Calendar size={11} /> Hari {currentDayIndex}/{totalDays}
                </span>
              )}
              {isPriority && (
                <span
                  title="Kegiatan Prioritas"
                  className="inline-flex items-center gap-1 bg-[#FF4D00] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs shrink-0"
                >
                  <i className="bi bi-exclamation-triangle"></i>
                  <span>PRIORITAS</span>
                </span>
              )}
              {isCompleted && (
                <span
                  title="Selesai (Completed)"
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full shadow-xs shrink-0"
                >
                  <Check size={12} strokeWidth={2.5} /> Selesai
                </span>
              )}
              {isReschedule && (
                <span
                  title="Reschedule"
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs shrink-0"
                >
                  <RescheduleIcon size={13} /> Reschedule
                </span>
              )}
              {extendedProps.notulensi && (
                <span
                  title="Notulensi Tersedia"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 shrink-0"
                >
                  <FileText size={11} /> Notulensi
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-ink-soft">
              {timeDisplay && (
                <span className="font-mono bg-line/60 px-2 py-0.5 rounded text-ink font-bold">
                  ⏱ {timeDisplay} WIB
                </span>
              )}
              {isMultiDay && (
                <span className="font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Calendar size={13} /> {extendedProps.tanggalMulai} s/d {extendedProps.tanggalSelesai}
                </span>
              )}
              {lokasiNama && (
                <span className="font-medium text-ink flex items-center gap-1">
                  <MapPin size={13} className="text-accent" /> {lokasiNama}
                </span>
              )}
              {picNames && (
                <span className="font-semibold text-accent flex items-center gap-1">
                  <User size={13} /> PIC: {picNames}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    const isMonthView = eventInfo.view.type === 'dayGridMonth';
    const isTimeGridView = eventInfo.view.type.startsWith('timeGrid');
    const isDarkBg = (isPriority && !isCompleted) || (status === 'pending' && !isCompleted);
    const textColor = isDarkBg ? 'text-white' : 'text-slate-900';
    const subTextColor = isDarkBg ? 'text-white/85' : 'text-slate-600';

    // Tampilan khusus di layar HP (Mobile Phone < 640px) saat mode Bulan (dayGridMonth):
    // Render pill rapi dengan dot warna agar nama agenda tidak terpotong menjadi 1 huruf
    if (isMonthView && typeof window !== 'undefined' && window.innerWidth < 640) {
      return (
        <div
          title={`${title}${timeDisplay ? ` (${timeDisplay} WIB)` : ''}${picNames ? ` - PIC: ${picNames}` : ''}`}
          className={`w-full px-1.5 py-0.5 rounded text-[10px] font-bold leading-tight truncate flex items-center gap-1 shadow-2xs cursor-pointer select-none ${textColor}`}
          style={{ backgroundColor }}
        >
          {isCompleted ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          ) : isPriority ? (
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
          ) : status === 'pending' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0" />
          )}
          <span className="truncate">{title}</span>
        </div>
      );
    }

    // Tampilan adaptif khusus Mode Hari / TimeGrid (timeGridDay / timeGridWeek)
    if (isTimeGridView) {
      let durationMinutes = 60;
      if (eventInfo.event.end && eventInfo.event.start) {
        durationMinutes = Math.round((eventInfo.event.end.getTime() - eventInfo.event.start.getTime()) / 60000);
      } else if (extendedProps.waktuMulai && extendedProps.waktuSelesai) {
        const [sh, sm] = (extendedProps.waktuMulai || '').split(':').map(Number);
        const [eh, em] = (extendedProps.waktuSelesai || '').split(':').map(Number);
        if (!isNaN(sh) && !isNaN(eh)) {
          durationMinutes = Math.max(30, (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0)));
        }
      }

      // 1. Durasi sangat pendek (<= 40 menit): Tampilan 1 baris ringkas & rapi
      if (durationMinutes <= 40) {
        return (
          <div
            title={`${title}${timeDisplay ? ` (${timeDisplay} WIB)` : ''}${lokasiNama ? ` - ${lokasiNama}` : ''}${picNames ? ` - PIC: ${picNames}` : ''}`}
            className={`w-full h-full px-2.5 py-1 flex items-center justify-between gap-2 overflow-hidden select-none cursor-pointer box-border ${textColor}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {timeDisplay && (
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                  isPriority && !isCompleted
                    ? 'bg-black/25 text-white'
                    : isDarkBg
                    ? 'bg-black/30 text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  <Clock size={10} className="shrink-0 opacity-80" />
                  <span>{timeDisplay}</span>
                </span>
              )}
              <span className="font-bold text-xs truncate">{title}</span>
              {lokasiNama && (
                <span className={`text-[10.5px] ${subTextColor} truncate hidden sm:inline-flex items-center gap-0.5 shrink-0`}>
                  <MapPin size={10.5} className={isDarkBg ? 'text-white/80' : 'text-accent'} />
                  <span>{lokasiNama}</span>
                </span>
              )}
              {picNames && (
                <span className={`text-[10.5px] ${subTextColor} truncate hidden md:inline-flex items-center gap-0.5 shrink-0`}>
                  <User size={10.5} className={isDarkBg ? 'text-white/80' : 'text-accent'} />
                  <span>PIC: {picNames}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isMultiDay && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDarkBg ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                  H-{currentDayIndex}/{totalDays}
                </span>
              )}
              {isPriority && (
                <span title="Prioritas" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/25 text-white shadow-2xs">
                  <i className="bi bi-exclamation-triangle text-[9px] font-bold"></i>
                </span>
              )}
              {isCompleted && (
                <span title="Selesai" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-2xs">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
          </div>
        );
      }

      // 2. Durasi menengah (45 menit s/d 1 jam 15 menit): 2 Baris horizontal luas (Tidak pernah terpotong)
      if (durationMinutes <= 75) {
        return (
          <div
            title={`${title}${timeDisplay ? ` (${timeDisplay} WIB)` : ''}${lokasiNama ? ` - ${lokasiNama}` : ''}${picNames ? ` - PIC: ${picNames}` : ''}`}
            className={`w-full h-full px-3 py-1.5 flex flex-col justify-between overflow-hidden select-none cursor-pointer box-border ${textColor}`}
          >
            {/* Baris 1: Waktu + Judul + Badges */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {timeDisplay && (
                  <span className={`font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                    isPriority && !isCompleted
                      ? 'bg-black/25 text-white border border-white/20'
                      : isDarkBg
                      ? 'bg-black/30 text-white'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    <Clock size={11} className="shrink-0 opacity-80" />
                    <span>{timeDisplay} WIB</span>
                  </span>
                )}
                <span className="font-bold text-xs sm:text-[13px] truncate tracking-tight">{title}</span>
              </div>

              {/* Badges on right */}
              <div className="flex items-center gap-1 shrink-0 ml-auto">
                {isMultiDay && (
                  <span
                    title={`Kegiatan multi-hari: Hari ke-${currentDayIndex} dari ${totalDays}`}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0 flex items-center gap-0.5 ${
                      isDarkBg ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <Calendar size={9} />
                    <span>H-{currentDayIndex}/{totalDays}</span>
                  </span>
                )}
                {isPriority && (
                  <span
                    title="Kegiatan Prioritas"
                    className="inline-flex items-center gap-1 bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs shrink-0"
                  >
                    <i className="bi bi-exclamation-triangle text-[9px]"></i>
                    <span>PRIORITAS</span>
                  </span>
                )}
                {isCompleted && (
                  <span
                    title="Selesai"
                    className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs shrink-0"
                  >
                    <Check size={9} strokeWidth={3} />
                    <span>Selesai</span>
                  </span>
                )}
                {isReschedule && (
                  <span
                    title="Reschedule"
                    className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isDarkBg ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <RescheduleIcon size={11} />
                    <span>Reschedule</span>
                  </span>
                )}
                {extendedProps.notulensi && (
                  <span
                    title="Ada Notulensi"
                    className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isDarkBg ? 'bg-white/20 text-white border border-white/30' : 'bg-accent/15 text-accent border border-accent/25'
                    }`}
                  >
                    <FileText size={9} />
                    <span>Notulensi</span>
                  </span>
                )}
              </div>
            </div>

            {/* Baris 2: Lokasi & PIC Horizontal */}
            <div className={`flex items-center gap-4 text-[10.5px] sm:text-[11px] min-w-0 pt-1 border-t ${
              isDarkBg ? 'border-white/20' : 'border-slate-200'
            }`}>
              <div className={`flex items-center gap-1.5 min-w-0 truncate ${subTextColor} font-medium`}>
                <MapPin size={11} className={`shrink-0 ${isDarkBg ? 'text-white/80' : 'text-accent'}`} />
                <span className="truncate">{lokasiNama || 'Lokasi belum ditentukan'}</span>
              </div>
              <div className={`flex items-center gap-1.5 min-w-0 truncate ${subTextColor} font-medium`}>
                <User size={11} className={`shrink-0 ${isDarkBg ? 'text-white/80' : 'text-accent'}`} />
                <span className="truncate">PIC: {picNames || 'Belum ada PIC'}</span>
              </div>
            </div>
          </div>
        );
      }

      // 3. Durasi panjang (> 1.5 jam): Tampilan berjarak leluasa & multi-baris
      return (
        <div
          title={`${title}${timeDisplay ? ` (${timeDisplay} WIB)` : ''}${lokasiNama ? ` - ${lokasiNama}` : ''}${picNames ? ` - PIC: ${picNames}` : ''}`}
          className={`w-full h-full px-3.5 py-2 flex flex-col justify-between overflow-hidden select-none cursor-pointer box-border ${textColor}`}
        >
          <div className="min-w-0">
            {/* Baris Atas: Waktu + Badges */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              {timeDisplay && (
                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded shrink-0 flex items-center gap-1.5 ${
                  isPriority && !isCompleted
                    ? 'bg-black/25 text-white border border-white/20'
                    : isDarkBg
                    ? 'bg-black/30 text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  <Clock size={12} className="shrink-0 opacity-80" />
                  <span>{timeDisplay} WIB</span>
                </span>
              )}

              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {isMultiDay && (
                  <span
                    title={`Kegiatan multi-hari: Hari ke-${currentDayIndex} dari ${totalDays}`}
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded leading-none shrink-0 flex items-center gap-1 ${
                      isDarkBg ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <Calendar size={10} />
                    <span>Hari {currentDayIndex}/{totalDays}</span>
                  </span>
                )}
                {isPriority && (
                  <span
                    title="Kegiatan Prioritas"
                    className="inline-flex items-center gap-1 bg-white/25 text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs shrink-0"
                  >
                    <i className="bi bi-exclamation-triangle text-[10px]"></i>
                    <span>PRIORITAS</span>
                  </span>
                )}
                {isCompleted && (
                  <span
                    title="Selesai"
                    className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs shrink-0"
                  >
                    <Check size={10} strokeWidth={3} />
                    <span>Selesai</span>
                  </span>
                )}
                {isReschedule && (
                  <span
                    title="Reschedule"
                    className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      isDarkBg ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <RescheduleIcon size={12} />
                    <span>Reschedule</span>
                  </span>
                )}
                {extendedProps.notulensi && (
                  <span
                    title="Ada Notulensi"
                    className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isDarkBg ? 'bg-white/20 text-white border border-white/30' : 'bg-accent/15 text-accent border border-accent/25'
                    }`}
                  >
                    <FileText size={10} />
                    <span>Notulensi</span>
                  </span>
                )}
              </div>
            </div>

            {/* Judul Kegiatan */}
            <div className="font-bold text-sm sm:text-base leading-snug tracking-tight line-clamp-2 mt-0.5">
              {title}
            </div>
          </div>

          {/* Footer: Lokasi & PIC */}
          <div className={`flex flex-wrap items-center gap-x-5 gap-y-1 pt-1.5 border-t text-[11px] sm:text-[11.5px] ${
            isDarkBg ? 'border-white/20' : 'border-slate-200'
          }`}>
            <div className={`flex items-center gap-1.5 min-w-0 truncate ${subTextColor} font-medium`}>
              <MapPin size={12} className={`shrink-0 ${isDarkBg ? 'text-white/80' : 'text-accent'}`} />
              <span className="truncate">{lokasiNama || 'Lokasi belum ditentukan'}</span>
            </div>
            <div className={`flex items-center gap-1.5 min-w-0 truncate ${subTextColor} font-medium`}>
              <User size={12} className={`shrink-0 ${isDarkBg ? 'text-white/80' : 'text-accent'}`} />
              <span className="truncate">PIC: {picNames || 'Belum ada PIC'}</span>
            </div>
          </div>
        </div>
      );
    }

    // Tampilan Standar Mode Bulan (dayGridMonth):
    return (
      <div
        title={`${title}${isMultiDay ? ` (Hari ${currentDayIndex}/${totalDays} - ${extendedProps.tanggalMulai} s/d ${extendedProps.tanggalSelesai})` : ''}${timeDisplay ? ` - ${timeDisplay} WIB` : ''}`}
        className={`p-1.5 w-full h-[90px] min-h-[90px] max-h-[90px] flex flex-col justify-between leading-snug cursor-pointer select-none box-border ${textColor}`}
      >
        <div className="min-w-0 w-full">
          {/* Top Bar: Strictly single line, no wrapping */}
          <div className="flex items-center justify-between gap-1 w-full min-w-0 mb-1 flex-nowrap">
            {timeDisplay ? (
              <div
                title={`${startWaktu}${endWaktu ? ` - ${endWaktu}` : ''} WIB`}
                className={`min-w-0 flex items-center gap-1 text-[9px] sm:text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded leading-none shrink truncate ${isPriority && !isCompleted
                  ? 'bg-black/25 text-white border border-white/20'
                  : isDarkBg
                    ? 'bg-black/30 text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
              >
                <Clock size={10} className="shrink-0 opacity-70" />
                <span className="truncate">{startWaktu}{endWaktu ? `-${endWaktu}` : ''}</span>
              </div>
            ) : <div className="shrink-0" />}

            {/* Badges on right: Multi-day, Priority, Completed, Reschedule, Notulensi */}
            <div className="flex items-center gap-1 shrink-0 ml-auto flex-nowrap">
              {isMultiDay && (
                <span
                  title={`Kegiatan multi-hari: Hari ke-${currentDayIndex} dari ${totalDays} (${extendedProps.tanggalMulai} s/d ${extendedProps.tanggalSelesai})`}
                  className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0 flex items-center gap-0.5 ${isPriority && !isCompleted
                    ? 'bg-white/25 text-white border border-white/30'
                    : isDarkBg
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                >
                  <Calendar size={8.5} />
                  <span>H-{currentDayIndex}/{totalDays}</span>
                </span>
              )}

              {isPriority && (
                <span
                  title="Kegiatan Prioritas"
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full shadow-2xs shrink-0 ${isCompleted ? 'bg-[#FF4D00] text-white' : 'bg-white/25 text-white'
                    }`}
                >
                  <i className="bi bi-exclamation-triangle text-[9px] font-bold leading-none"></i>
                </span>
              )}

              {isCompleted && (
                <span
                  title="Selesai (Completed)"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-2xs shrink-0"
                >
                  <Check size={10} strokeWidth={3} />
                </span>
              )}

              {isReschedule && (
                <span
                  title="Reschedule"
                  className="inline-flex items-center justify-center w-4 h-4 text-amber-700 shrink-0"
                >
                  <RescheduleIcon size={14} />
                </span>
              )}

              {extendedProps.notulensi && (
                <span
                  title="Ada Notulensi"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent/20 text-accent shrink-0 border border-accent/30"
                >
                  <FileText size={10} />
                </span>
              )}
            </div>
          </div>

          {/* Title: strictly 1 single row with truncate */}
          <div
            title={title}
            className={`font-bold text-xs sm:text-[12.5px] ${textColor} leading-tight truncate mt-0.5 tracking-tight`}
          >
            {title}
          </div>
        </div>

        {/* Location & PIC footer: Anchored to bottom, always 2 uniform rows */}
        <div className={`space-y-0.5 mt-auto pt-1 border-t shrink-0 ${
          isDarkBg ? 'border-white/20' : 'border-black/5 dark:border-white/10'
        }`}>
          <div
            title={lokasiNama || 'Lokasi belum ditentukan'}
            className={`text-[10px] sm:text-[10.5px] ${subTextColor} font-medium flex items-center gap-1 truncate leading-tight`}
          >
            <MapPin size={9.5} className={`shrink-0 ${isDarkBg ? 'text-white/80' : 'text-accent opacity-80'}`} />
            <span className="truncate">{lokasiNama || '---'}</span>
          </div>
          <div
            title={picNames ? `PIC: ${picNames}` : 'PIC belum ditentukan'}
            className={`text-[10px] sm:text-[10.5px] ${subTextColor} font-medium flex items-center gap-1 truncate leading-tight`}
          >
            <User size={9.5} className={`shrink-0 ${isDarkBg ? 'text-white/80' : 'text-accent opacity-80'}`} />
            <span className="truncate">PIC: {picNames || '---'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Management Toolbar */}
      <div className="bg-surface p-4 sm:p-5 rounded-xl border border-line/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 flex-1 w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Cari event, lokasi, PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 border border-line rounded-lg bg-bg text-sm font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-bg px-3.5 py-2 border border-line rounded-lg text-sm w-full sm:w-auto">
            <Filter size={14} className="text-accent shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-ink font-semibold w-full sm:w-auto text-sm cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="new">NEW</option>
              <option value="reschedule">RESCHEDULE</option>
              <option value="pending">PENDING</option>
              <option value="completed">COMPLETED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-bg px-3.5 py-2 border border-line rounded-lg text-sm w-full sm:w-auto">
            <Filter size={14} className="text-accent shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-ink font-semibold w-full sm:w-auto text-sm cursor-pointer"
            >
              <option value="all">Semua Prioritas</option>
              <option value="priority">🔥 Priority Event (#FF4D00)</option>
              <option value="standard">Standard Event</option>
            </select>
          </div>
        </div>

        {/* Add Event Button */}
        <button
          onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}
          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-navy-deep to-ink text-surface hover:brightness-110 active:scale-98 px-5 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus size={18} /> + Tambah Event Kegiatan
        </button>
      </div>

      {/* Legend Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-surface rounded-xl border border-line/80 shadow-xs text-xs font-semibold text-ink">
        <span className="text-ink-soft uppercase tracking-wider text-[11px] font-bold">Indikator Warna:</span>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#b7e1cd] border border-[#86c7a8]"></span> New / Update</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#FF4D00]"></span> Prioritas (<i className="bi bi-exclamation-triangle text-[#FF4D00]"></i>)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#dc2626]"></span> Pending (Merah)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ffffff] border border-slate-300"></span> Completed (✓)</span>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-surface rounded-xl border border-line/80 shadow-xs p-3 sm:p-6 overflow-hidden">
        {/* Mobile View Switcher Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-ink-soft bg-accent/5 border border-accent/20 px-3 py-2 rounded-lg mb-3">
          <span className="flex items-center gap-1.5 font-medium text-ink">
            <span>💡</span>
            <span>Gunakan tombol <strong>Agenda</strong> untuk daftar vertikal lengkap atau <strong>Bulan</strong> untuk kalender</span>
          </span>
        </div>

        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView={typeof window !== 'undefined' && window.innerWidth < 768 ? 'listMonth' : 'dayGridMonth'}
            headerToolbar={{
              left: 'prev,today,next',
              center: 'title',
              right: 'listMonth,dayGridMonth,timeGridDay'
            }}
            buttonText={{
              today: 'Hari Ini',
              list: 'Agenda',
              month: 'Bulan',
              day: 'Hari'
            }}
            events={mappedEvents}
            locales={[idLocale]}
            locale="id"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            slotLabelInterval="01:00:00"
            views={{
              timeGridDay: {
                dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
              }
            }}
            eventOrder={(a, b) => {
              const orderA = a.extendedProps?.order ?? a.order ?? 999;
              const orderB = b.extendedProps?.order ?? b.order ?? 999;
              if (orderA !== orderB) return orderA - orderB;

              const timeA = a.extendedProps?.waktuMulai || '';
              const timeB = b.extendedProps?.waktuMulai || '';
              if (timeA && !timeB) return 1;
              if (!timeA && timeB) return -1;
              if (timeA !== timeB) return timeA.localeCompare(timeB);

              return (a.title || '').localeCompare(b.title || '');
            }}
            eventDisplay="block"
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:30:00"
            expandRows={true}
          />
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
