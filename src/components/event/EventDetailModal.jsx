import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Mail, Phone, AlertCircle, CheckCircle, Edit3, Trash2, History, FileText, Link as LinkIcon, ExternalLink, Copy, Check, Plus, Building2 } from 'lucide-react';
import { useEventStore } from '../../store/eventStore';
import { isUpdateColorActive, getEffectiveStatus } from '../../utils/dateUtils';

export default function EventDetailModal({
  event,
  onClose,
  onEdit,
  readOnly = false
}) {
  const { deleteEvent, markStatus, updateEvent } = useEventStore();
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isEditingNotulensi, setIsEditingNotulensi] = useState(false);
  const [notulensiInput, setNotulensiInput] = useState(event?.notulensi || '');
  const [notulensiLinkInput, setNotulensiLinkInput] = useState(event?.notulensiLink || '');
  const [isSavingNotulensi, setIsSavingNotulensi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState(null);

  const handleSendReminder = async () => {
    if (!currentEvent.id) return;
    setIsSendingReminder(true);
    setReminderMessage(null);
    try {
      const response = await fetch('/api/reminders/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: currentEvent.id,
          force: true
        })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setReminderMessage({ type: 'success', text: 'Email reminder berhasil dikirim ke PIC!' });
      } else {
        setReminderMessage({ type: 'error', text: data.message || 'Gagal mengirim reminder' });
      }
    } catch (err) {
      setReminderMessage({ type: 'error', text: 'Terjadi kesalahan jaringan saat mengirim email' });
    } finally {
      setIsSendingReminder(false);
    }
  };

  useEffect(() => {
    setCurrentEvent(event);
    setNotulensiInput(event?.notulensi || '');
    setNotulensiLinkInput(event?.notulensiLink || '');
    setReminderMessage(null);
  }, [event]);

  if (!currentEvent) return null;

  const handleDelete = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus event "${currentEvent.judul}"?`)) {
      deleteEvent(currentEvent.id);
      onClose();
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = loggedUser.name || 'Admin Safety';

    setCurrentEvent((prev) => ({
      ...prev,
      status: newStatus,
      diperbaruiOleh: { id: 'u1', nama: currentUserName },
      diperbaruiPada: new Date().toISOString()
    }));

    await markStatus(currentEvent.id, newStatus);
  };

  const handleSaveNotulensi = async () => {
    setIsSavingNotulensi(true);
    const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = loggedUser.name || 'Admin Safety';

    const updatedData = {
      notulensi: notulensiInput,
      notulensiLink: notulensiLinkInput,
      diperbaruiOleh: { id: 'u1', nama: currentUserName },
      diperbaruiPada: new Date().toISOString()
    };

    setCurrentEvent((prev) => ({
      ...prev,
      ...updatedData
    }));

    await updateEvent(currentEvent.id, updatedData);
    setIsSavingNotulensi(false);
    setIsEditingNotulensi(false);
  };

  const handleCopyNotulensi = () => {
    if (!currentEvent.notulensi) return;
    const textToCopy = `*NOTULENSI: ${currentEvent.judul}*\nTanggal: ${currentEvent.tanggalMulai}\nLokasi: ${currentEvent.lokasi?.nama || '-'}\n\n${currentEvent.notulensi}${currentEvent.notulensiLink ? `\n\nLink Dokumentasi: ${currentEvent.notulensiLink}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (event) => {
    const status = typeof event === 'object' ? getEffectiveStatus(event) : event;
    switch (status) {
      case 'new': return <span className="bg-new/15 text-new font-bold text-xs px-2.5 py-1 rounded-full uppercase">NEW</span>;
      case 'reschedule':
      case 'updated':
        return isUpdateColorActive(typeof event === 'object' ? event : { status: 'reschedule' })
          ? <span className="bg-update/15 text-update font-bold text-xs px-2.5 py-1 rounded-full uppercase">RESCHEDULE</span>
          : <span className="bg-ink-soft/15 text-ink-soft font-bold text-xs px-2.5 py-1 rounded-full uppercase">RESCHEDULE</span>;
      case 'pending': return <span className="bg-[#dc2626]/15 text-[#dc2626] font-bold text-xs px-2.5 py-1 rounded-full uppercase border border-[#dc2626]/20">PENDING</span>;
      case 'completed': return <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full uppercase border border-emerald-200">COMPLETED</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority !== 'priority' && priority !== 'high') return null;
    return (
      <span className="bg-[#FF4D00] text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase inline-flex items-center gap-1.5 shadow-xs">
        <i className="bi bi-exclamation-triangle"></i>
        <span>PRIORITAS</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-surface rounded-2xl max-w-2xl w-full border border-line/80 shadow-2xl overflow-hidden my-auto sm:my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-line flex items-center justify-between bg-bg shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {getStatusBadge(currentEvent)}
            {getPriorityBadge(currentEvent.priority)}
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors p-1 rounded-md shrink-0 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">{currentEvent.judul}</h2>
            <p className="text-ink-soft text-xs sm:text-sm leading-relaxed">{currentEvent.deskripsi || 'Tidak ada deskripsi.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 bg-bg rounded-lg border border-line/60">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-ink">
              <Calendar size={18} className="text-accent shrink-0" />
              <div>
                <span className="text-[11px] sm:text-xs text-ink-soft block">Tanggal</span>
                <span className="font-semibold">{currentEvent.tanggalMulai} {currentEvent.tanggalSelesai && currentEvent.tanggalSelesai !== currentEvent.tanggalMulai ? `s/d ${currentEvent.tanggalSelesai}` : ''}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-ink">
              <Clock size={18} className="text-accent shrink-0" />
              <div>
                <span className="text-[11px] sm:text-xs text-ink-soft block">Waktu Pelaksanaan</span>
                <span className="font-semibold">
                  {currentEvent.waktuMulai
                    ? `${currentEvent.waktuMulai}${currentEvent.waktuSelesai ? ` - ${currentEvent.waktuSelesai}` : ''} WIB`
                    : 'Sepanjang hari / Fleksibel'}
                </span>
              </div>
            </div>

            {currentEvent.penyelenggara && (
              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink sm:col-span-2">
                <Building2 size={18} className="text-accent shrink-0" />
                <div>
                  <span className="text-[11px] sm:text-xs text-ink-soft block">Penyelenggara</span>
                  <span className="font-semibold">{currentEvent.penyelenggara}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs sm:text-sm text-ink sm:col-span-2">
              <MapPin size={18} className="text-accent shrink-0" />
              <div>
                <span className="text-[11px] sm:text-xs text-ink-soft block">Lokasi</span>
                <span className="font-semibold">{currentEvent.lokasi?.nama || '-'}</span>
                {currentEvent.lokasi?.link && (
                  <a href={currentEvent.lokasi.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-accent hover:underline block sm:inline">
                    (Buka Link Google Maps)
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* PIC Section */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-ink uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={16} className="text-accent" />
              Person In Charge (PIC)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentEvent.pic && currentEvent.pic.length > 0 ? (
                currentEvent.pic.map((p, idx) => (
                  <div key={idx} className="p-3 bg-bg border border-line rounded-md text-xs sm:text-sm space-y-1">
                    <div className="font-semibold text-ink">{p.nama}</div>
                    {p.email && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-soft truncate">
                        <Mail size={13} className="shrink-0" /> {p.email}
                      </div>
                    )}
                    {p.noTelp && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                        <Phone size={13} className="shrink-0" /> {p.noTelp}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs sm:text-sm text-ink-soft">Belum ada PIC terdaftar.</div>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <h3 className="text-xs sm:text-sm font-semibold text-ink uppercase tracking-wider">Reminder Email PIC</h3>
              {!readOnly && (
                <button
                  type="button"
                  disabled={isSendingReminder}
                  onClick={handleSendReminder}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white border border-accent/30 px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  title="Kirim email reminder ke PIC sekarang"
                >
                  <Mail size={13} className={isSendingReminder ? 'animate-bounce' : ''} />
                  <span>{isSendingReminder ? 'Mengirim...' : 'Kirim Reminder Sekarang'}</span>
                </button>
              )}
            </div>

            {reminderMessage && (
              <div className={`mb-2.5 p-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                reminderMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {reminderMessage.type === 'success' ? <Check size={14} className="text-emerald-600 shrink-0" /> : <AlertCircle size={14} className="text-rose-600 shrink-0" />}
                <span>{reminderMessage.text}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {currentEvent.reminders && currentEvent.reminders.length > 0 ? (
                currentEvent.reminders.map((r, idx) => {
                  const type = typeof r === 'string' ? r : r.type;
                  const enabled = typeof r === 'string' ? true : (r.enabled !== false);
                  return (
                    <span key={idx} className={`text-xs px-2.5 py-1 rounded-full border ${enabled ? 'bg-accent/10 text-accent border-accent/30 font-medium' : 'bg-line/40 text-ink-soft border-line line-through'
                      }`}>
                      {type}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-ink-soft">H-7, H-3, H-1, Hari H</span>
              )}
            </div>
            <p className="text-[11px] text-ink-soft mt-1.5">
              Notifikasi terjadwal dikirim otomatis jam 07:00 pagi. Khusus Hari H dikirim jam 07:00 pagi & H-1 jam sebelum acara.
            </p>
          </div>

          {/* Notulensi Kegiatan */}
          <div className="border border-line/80 rounded-xl p-3.5 sm:p-4 bg-bg/50 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-semibold text-ink uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                Notulensi & Hasil Kegiatan
              </h3>

              {!readOnly && !isEditingNotulensi && (
                <div className="flex items-center gap-1.5">
                  {currentEvent.notulensi && (
                    <button
                      type="button"
                      onClick={handleCopyNotulensi}
                      className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-ink-soft hover:text-ink font-medium px-2.5 py-1 rounded-md bg-surface border border-line/80 transition-colors shadow-2xs cursor-pointer"
                      title="Salin notulensi"
                    >
                      {copied ? <Check size={12} className="text-new" /> : <Copy size={12} />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setNotulensiInput(currentEvent.notulensi || '');
                      setNotulensiLinkInput(currentEvent.notulensiLink || '');
                      setIsEditingNotulensi(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-accent hover:text-white hover:bg-accent px-2.5 py-1 rounded-md bg-accent/10 border border-accent/25 transition-colors cursor-pointer"
                  >
                    <Edit3 size={12} />
                    <span>{currentEvent.notulensi ? 'Edit Notulensi' : '+ Tulis Notulensi'}</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingNotulensi ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Isi Catatan Notulensi
                  </label>
                  <textarea
                    rows={4}
                    value={notulensiInput}
                    onChange={(e) => setNotulensiInput(e.target.value)}
                    placeholder="Tulis ringkasan hasil kegiatan, kesepakatan, temuan, atau tindak lanjut..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-line rounded-lg bg-surface text-ink focus:ring-2 focus:ring-accent focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
                    <LinkIcon size={12} className="text-accent" />
                    Link Lampiran / Foto / Dokumen
                  </label>
                  <input
                    type="url"
                    value={notulensiLinkInput}
                    onChange={(e) => setNotulensiLinkInput(e.target.value)}
                    placeholder="https://drive.google.com/... (Google Drive, Foto kegiatan, dll)"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-line rounded-lg bg-surface text-ink focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotulensi(false)}
                    disabled={isSavingNotulensi}
                    className="px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-ink bg-surface border border-line rounded-md transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotulensi}
                    disabled={isSavingNotulensi}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-navy-deep hover:bg-ink rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isSavingNotulensi ? (
                      <span>Menyimpan...</span>
                    ) : (
                      <>
                        <Check size={13} />
                        <span>Simpan Notulensi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : currentEvent.notulensi ? (
              <div className="space-y-2.5">
                <div className="p-3.5 bg-surface rounded-lg border border-line/70 text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {currentEvent.notulensi}
                </div>
                {currentEvent.notulensiLink && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] sm:text-xs text-ink-soft flex items-center gap-1">
                      <LinkIcon size={12} className="text-accent" /> Dokumentasi:
                    </span>
                    <a
                      href={currentEvent.notulensiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
                    >
                      <ExternalLink size={12} /> Buka Tautan Lampiran
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-surface/70 rounded-lg border border-dashed border-line gap-2.5 text-center sm:text-left">
                <div className="text-xs text-ink-soft">
                  Belum ada notulensi atau catatan hasil kegiatan.
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotulensiInput('');
                      setNotulensiLinkInput('');
                      setIsEditingNotulensi(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:bg-accent/10 px-2.5 py-1 rounded-md border border-accent/30 transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus size={13} /> Tulis Notulensi Sekarang
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Internal History */}
          <div className="border-t border-line pt-4">
            <h3 className="text-[11px] sm:text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History size={14} /> Histori Internal
            </h3>
            <div className="space-y-1 text-[11px] sm:text-xs text-ink-soft">
              <div>Dibuat oleh: <strong>{currentEvent.dibuatOleh?.nama || 'System'}</strong> ({currentEvent.dibuatPada ? new Date(currentEvent.dibuatPada).toLocaleString('id-ID') : '-'})</div>
              {currentEvent.diperbaruiOleh && (
                <div>Terakhir diperbarui oleh: <strong>{currentEvent.diperbaruiOleh.nama}</strong> ({currentEvent.diperbaruiPada ? new Date(currentEvent.diperbaruiPada).toLocaleString('id-ID') : '-'})</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {!readOnly && onEdit && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-line bg-bg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {currentEvent.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium bg-new/10 text-new hover:bg-new hover:text-white px-3 py-2 rounded-md transition-colors border border-new/20 cursor-pointer"
                >
                  <CheckCircle size={14} /> Mark as Completed
                </button>
              )}
              {currentEvent.status !== 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium bg-pending/10 text-pending hover:bg-pending hover:text-white px-3 py-2 rounded-md transition-colors border border-pending/20 cursor-pointer"
                >
                  <AlertCircle size={14} /> Mark as Pending
                </button>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => { onClose(); onEdit(currentEvent); }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-medium bg-navy-deep text-surface hover:bg-ink px-3 py-2 rounded-md transition-colors cursor-pointer"
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-medium bg-pending text-white hover:bg-pending/80 px-3 py-2 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
