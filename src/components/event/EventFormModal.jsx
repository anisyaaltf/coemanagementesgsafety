import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckSquare,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Database,
  Plus,
  Trash2,
  Building2
} from 'lucide-react';
import { useEventStore } from '../../store/eventStore';

const eventSchema = z.object({
  judul: z.string().min(3, 'Judul kegiatan minimal 3 karakter'),
  penyelenggara: z.string().optional(),
  tanggalMulai: z.string().min(1, 'Tanggal mulai harus diisi'),
  tanggalSelesai: z.string().optional(),
  waktuMulai: z.string().optional(),
  waktuSelesai: z.string().optional(),
  lokasiNama: z.string().optional(),
  lokasiLink: z.string().optional(),
  picId: z.string().optional(),
  picNama: z.string().optional(),
  picEmail: z.string().optional(),
  picNoTelp: z.string().optional(),
  isHighPriority: z.boolean().optional(),
  status: z.enum(['new', 'reschedule', 'updated', 'pending', 'completed']),
  deskripsi: z.string().optional(),
  notulensi: z.string().optional(),
  notulensiLink: z.string().optional(),
  reminders: z.array(z.string()).optional()
});

export default function EventFormModal({ initialData, onClose }) {
  const { addEvent, updateEvent, pics, fetchPics } = useEventStore();
  const isEditing = Boolean(initialData?.id);

  // Fetch PIC terbaru dari database Supabase saat modal dibuka
  useEffect(() => {
    fetchPics();
  }, [fetchPics]);

  const defaultValues = isEditing
    ? {
      judul: initialData.judul || '',
      penyelenggara: initialData.penyelenggara || '',
      tanggalMulai: initialData.tanggalMulai || '',
      tanggalSelesai: initialData.tanggalSelesai || '',
      waktuMulai: initialData.waktuMulai || '',
      waktuSelesai: initialData.waktuSelesai || '',
      lokasiNama: initialData.lokasi?.nama || '',
      lokasiLink: initialData.lokasi?.link || '',
      isHighPriority: initialData.priority === 'priority' || initialData.priority === 'high',
      status: initialData.status || 'new',
      deskripsi: initialData.deskripsi || '',
      notulensi: initialData.notulensi || '',
      notulensiLink: initialData.notulensiLink || '',
      reminders: Array.isArray(initialData.reminders)
        ? initialData.reminders
            .filter(r => (typeof r === 'object' ? r.enabled : true))
            .map(r => (typeof r === 'object' ? r.type : r))
        : ['H-7', 'H-3', 'H-1', 'Hari H']
    }
    : {
      judul: '',
      penyelenggara: '',
      tanggalMulai: initialData?.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggalSelesai: initialData?.tanggalSelesai || new Date().toISOString().split('T')[0],
      waktuMulai: '',
      waktuSelesai: '',
      lokasiNama: '',
      lokasiLink: '',
      isHighPriority: false,
      status: 'new',
      deskripsi: '',
      notulensi: '',
      notulensiLink: '',
      reminders: ['H-7', 'H-3', 'H-1', 'Hari H']
    };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues
  });

  // State checklist kegiatan di hari yang sama
  const [isSameDay, setIsSameDay] = useState(() => {
    if (isEditing) {
      return !initialData?.tanggalSelesai || initialData.tanggalMulai === initialData.tanggalSelesai;
    }
    return true;
  });

  const watchedTanggalMulai = watch('tanggalMulai');

  // Sinkronkan otomatis tanggalSelesai jika checklist hari yang sama aktif
  useEffect(() => {
    if (isSameDay && watchedTanggalMulai) {
      setValue('tanggalSelesai', watchedTanggalMulai);
    }
  }, [isSameDay, watchedTanggalMulai, setValue]);

  const handleSameDayToggle = (e) => {
    const checked = e.target.checked;
    setIsSameDay(checked);
    if (checked) {
      const curMulai = watch('tanggalMulai');
      if (curMulai) {
        setValue('tanggalSelesai', curMulai);
      }
    }
  };

  // State daftar PIC (bisa lebih dari satu)
  const [picList, setPicList] = useState(() => {
    if (Array.isArray(initialData?.pic) && initialData.pic.length > 0) {
      return initialData.pic.map((p) => {
        const hasDbId = p.id && !p.id.toString().startsWith('p_');
        return {
          id: p.id ? p.id.toString() : '',
          nama: p.nama || '',
          email: p.email || '',
          noTelp: p.noTelp || p.no_telp || '',
          selectedOption: hasDbId ? p.id.toString() : (p.nama ? 'custom' : ''),
          isCustom: !hasDbId
        };
      });
    }
    return [
      {
        id: '',
        nama: '',
        email: '',
        noTelp: '',
        selectedOption: '',
        isCustom: false
      }
    ];
  });

  const [picErrors, setPicErrors] = useState({});

  // Sinkronkan daftar PIC saat data pics selesai dimuat dari database
  useEffect(() => {
    if (initialData?.pic && initialData.pic.length > 0 && pics.length > 0) {
      setPicList(
        initialData.pic.map((p) => {
          const match = pics.find(
            (dbP) =>
              (p.id && dbP.id?.toString() === p.id.toString()) ||
              (p.email && dbP.email?.toLowerCase() === p.email.toLowerCase()) ||
              (p.nama && dbP.nama?.toLowerCase() === p.nama.toLowerCase())
          );
          if (match) {
            return {
              id: match.id?.toString() || '',
              nama: match.nama,
              email: match.email,
              noTelp: match.noTelp || match.no_telp || '',
              selectedOption: match.id?.toString() || '',
              isCustom: false
            };
          }
          return {
            id: p.id ? p.id.toString() : '',
            nama: p.nama || '',
            email: p.email || '',
            noTelp: p.noTelp || p.no_telp || '',
            selectedOption: 'custom',
            isCustom: true
          };
        })
      );
    }
  }, [pics, initialData]);

  // Tambah baris PIC baru
  const handleAddPic = () => {
    setPicList((prev) => [
      ...prev,
      {
        id: '',
        nama: '',
        email: '',
        noTelp: '',
        selectedOption: '',
        isCustom: false
      }
    ]);
  };

  // Hapus PIC tertentu
  const handleRemovePic = (index) => {
    if (picList.length <= 1) return;
    setPicList((prev) => prev.filter((_, idx) => idx !== index));
    setPicErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  // Handler pemilihan PIC dari dropdown per baris
  const handlePicSelect = (index, val) => {
    setPicList((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (val === 'custom') {
          return {
            ...item,
            selectedOption: 'custom',
            id: '',
            nama: '',
            email: '',
            noTelp: '',
            isCustom: true
          };
        }
        if (!val) {
          return {
            ...item,
            selectedOption: '',
            id: '',
            nama: '',
            email: '',
            noTelp: '',
            isCustom: false
          };
        }
        const found = pics.find((p) => p.id?.toString() === val.toString());
        if (found) {
          return {
            ...item,
            selectedOption: val,
            id: found.id?.toString() || '',
            nama: found.nama,
            email: found.email,
            noTelp: found.noTelp || found.no_telp || '',
            isCustom: false
          };
        }
        return item;
      })
    );

    if (picErrors[index]) {
      setPicErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  // Handler update field input PIC manual
  const handlePicFieldChange = (index, field, value) => {
    setPicList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
    if (picErrors[index]?.[field]) {
      setPicErrors((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: undefined
        }
      }));
    }
  };

  // Validasi seluruh daftar PIC sebelum submit
  const validatePicList = () => {
    const newErrors = {};
    let isValid = true;

    if (!picList || picList.length === 0) {
      return false;
    }

    picList.forEach((p, idx) => {
      const itemErrors = {};
      if (!p.nama || p.nama.trim().length < 2) {
        itemErrors.nama = 'Nama PIC wajib diisi (min 2 karakter)';
        isValid = false;
      }
      if (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
        itemErrors.email = 'Email PIC tidak valid';
        isValid = false;
      }
      if (Object.keys(itemErrors).length > 0) {
        newErrors[idx] = itemErrors;
      }
    });

    setPicErrors(newErrors);
    return isValid;
  };

  const onSubmit = async (data) => {
    if (!validatePicList()) {
      return;
    }

    const allReminderTypes = ['H-7', 'H-3', 'H-1', 'Hari H'];
    const reminderArray = allReminderTypes.map(type => ({
      type,
      enabled: data.reminders?.includes(type) || false
    }));

    const formattedPics = picList.map((p, idx) => ({
      id: p.id || (p.selectedOption && p.selectedOption !== 'custom' ? p.selectedOption : `p_${Date.now()}_${idx}`),
      nama: p.nama.trim(),
      email: p.email.trim(),
      noTelp: (p.noTelp || '').trim()
    }));

    const finalTanggalSelesai = isSameDay
      ? (data.tanggalMulai || watch('tanggalMulai'))
      : (data.tanggalSelesai || data.tanggalMulai || watch('tanggalMulai'));

    const eventPayload = {
      judul: data.judul,
      penyelenggara: (data.penyelenggara || '').trim(),
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: finalTanggalSelesai,
      waktuMulai: data.waktuMulai || '',
      waktuSelesai: data.waktuSelesai || '',
      lokasi: {
        nama: (data.lokasiNama || '').trim(),
        link: data.lokasiLink || ''
      },
      pic: formattedPics,
      priority: data.isHighPriority ? 'priority' : 'standard',
      status: data.status,
      deskripsi: data.deskripsi || '',
      notulensi: data.notulensi || '',
      notulensiLink: data.notulensiLink || '',
      reminders: reminderArray
    };

    if (isEditing) {
      await updateEvent(initialData.id, eventPayload);
    } else {
      const res = await addEvent(eventPayload);
      if (res && res.synced === false) {
        alert(
          'Perhatian: Server backend tidak dapat dihubungi. Kegiatan tersimpan secara offline di browser perangkat ini, tetapi belum masuk ke database Supabase.'
        );
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-surface rounded-2xl max-w-2xl w-full border border-line/80 shadow-2xl overflow-hidden my-auto sm:my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-line flex items-center justify-between bg-bg shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-ink">
            {isEditing ? 'Edit Event Kegiatan' : 'Tambah Event Kegiatan Baru'}
          </h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors p-1 rounded-md shrink-0 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Judul & Penyelenggara */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">Nama Kegiatan *</label>
              <input
                type="text"
                {...register('judul')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="Contoh: Safety Patrol Area Casting"
              />
              {errors.judul && <p className="text-xs text-pending mt-1">{errors.judul.message}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Building2 size={14} className="text-accent" /> Nama Penyelenggara <span className="text-ink-soft text-xs font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                {...register('penyelenggara')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="Contoh: Panitia K3 / Divisi HR / PT ABC"
              />
            </div>
          </div>

          {/* Checklist Hari yang Sama */}
          <div className="pt-0.5">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-ink bg-bg px-3 py-2 rounded-lg border border-line hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={isSameDay}
                onChange={handleSameDayToggle}
                className="w-4 h-4 rounded border-line text-accent focus:ring-accent cursor-pointer accent-accent"
              />
              <span>Kegiatan di hari yang sama</span>
              <span className="text-ink-soft text-xs font-normal">(Tanggal selesai otomatis sama)</span>
            </label>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Calendar size={14} className="text-accent" /> Tanggal Mulai *
              </label>
              <input
                type="date"
                {...register('tanggalMulai')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              />
              {errors.tanggalMulai && <p className="text-xs text-pending mt-1">{errors.tanggalMulai.message}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Calendar size={14} className="text-accent" /> Tanggal Selesai *
                {isSameDay && <span className="text-[11px] text-ink-soft font-normal">(Otomatis sama)</span>}
              </label>
              <input
                type="date"
                {...register('tanggalSelesai')}
                readOnly={isSameDay}
                className={`w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm transition-opacity ${
                  isSameDay ? 'opacity-65 bg-line/25 cursor-not-allowed' : ''
                }`}
              />
              {errors.tanggalSelesai && <p className="text-xs text-pending mt-1">{errors.tanggalSelesai.message}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Clock size={14} className="text-accent" /> Waktu Mulai (WIB) <span className="text-ink-soft text-xs font-normal">(Opsional)</span>
              </label>
              <input
                type="time"
                {...register('waktuMulai')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Clock size={14} className="text-accent" /> Waktu Selesai (WIB) <span className="text-ink-soft text-xs font-normal">(Opsional)</span>
              </label>
              <input
                type="time"
                {...register('waktuSelesai')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-accent" /> Nama Lokasi <span className="text-ink-soft text-xs font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                {...register('lokasiNama')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="Contoh: Meeting Room 2"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">Link Maps Lokasi (Opsional)</label>
              <input
                type="url"
                {...register('lokasiLink')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          {/* PIC Data Terhubung ke Database */}
          <div className="p-3.5 sm:p-4 border border-line rounded-xl bg-bg space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-line/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <User size={14} className="text-accent" /> Data Person In Charge (PIC)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Database size={12} /> Terhubung Database PIC
                </span>
                <span className="text-[11px] text-ink-soft">
                  • {pics.length > 0 ? `${pics.length} PIC terdaftar` : 'Memuat data...'}
                </span>
              </div>
            </div>

            {/* List PIC Item */}
            <div className="space-y-3">
              {picList.map((item, index) => {
                const isItemFromDb = !item.isCustom && Boolean(item.selectedOption && item.selectedOption !== 'custom');
                const selectedDbPic = isItemFromDb
                  ? pics.find((p) => p.id?.toString() === item.selectedOption?.toString())
                  : null;
                const err = picErrors[index] || {};

                return (
                  <div
                    key={index}
                    className="p-3 sm:p-3.5 border border-line rounded-lg bg-surface/70 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        PIC #{index + 1}
                      </span>
                      {picList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePic(index)}
                          className="text-pending hover:text-pending/80 text-xs font-semibold flex items-center gap-1 py-0.5 px-2 hover:bg-pending/10 rounded transition-colors cursor-pointer"
                          title="Hapus PIC ini"
                        >
                          <Trash2 size={13} />
                          <span>Hapus PIC</span>
                        </button>
                      )}
                    </div>

                    {/* Dropdown Pilihan PIC */}
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Pilih PIC dari Database *
                      </label>
                      <select
                        value={item.selectedOption || ''}
                        onChange={(e) => handlePicSelect(index, e.target.value)}
                        className="w-full px-3.5 py-2 border border-line rounded-md bg-surface text-ink text-sm font-medium focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer transition-shadow"
                      >
                        <option value="">-- Pilih PIC dari Database --</option>
                        {pics.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} {p.departemen ? `(${p.departemen})` : ''} — {p.email}
                          </option>
                        ))}
                        <option value="custom">+ Input Manual / PIC Baru</option>
                      </select>
                    </div>

                    {/* Banner Indikator PIC Terpilih Otomatis */}
                    {isItemFromDb && selectedDbPic && (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-ink animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                              {selectedDbPic.nama}
                            </span>
                            <span className="text-ink-soft text-[11px] ml-1.5">
                              {selectedDbPic.departemen || 'Safety Officer'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                          Otomatis Terisi
                        </span>
                      </div>
                    )}

                    {/* Field Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-ink mb-1">Nama PIC *</label>
                        <input
                          type="text"
                          value={item.nama || ''}
                          onChange={(e) => handlePicFieldChange(index, 'nama', e.target.value)}
                          readOnly={isItemFromDb}
                          className={`w-full px-3 py-1.5 border rounded-md text-sm transition-colors ${
                            err.nama ? 'border-pending ring-1 ring-pending' : 'border-line'
                          } ${
                            isItemFromDb
                              ? 'bg-surface/70 text-ink cursor-default font-medium'
                              : 'bg-surface text-ink focus:ring-2 focus:ring-accent'
                          }`}
                          placeholder="Citra"
                        />
                        {err.nama && <p className="text-[11px] text-pending mt-0.5">{err.nama}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink mb-1">Email *</label>
                        <input
                          type="email"
                          value={item.email || ''}
                          onChange={(e) => handlePicFieldChange(index, 'email', e.target.value)}
                          readOnly={isItemFromDb}
                          className={`w-full px-3 py-1.5 border rounded-md text-sm transition-colors ${
                            err.email ? 'border-pending ring-1 ring-pending' : 'border-line'
                          } ${
                            isItemFromDb
                              ? 'bg-surface/70 text-ink cursor-default font-medium'
                              : 'bg-surface text-ink focus:ring-2 focus:ring-accent'
                          }`}
                          placeholder="citra@safety.local"
                        />
                        {err.email && <p className="text-[11px] text-pending mt-0.5">{err.email}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink mb-1">No. Telepon</label>
                        <input
                          type="text"
                          value={item.noTelp || ''}
                          onChange={(e) => handlePicFieldChange(index, 'noTelp', e.target.value)}
                          readOnly={isItemFromDb}
                          className={`w-full px-3 py-1.5 border border-line rounded-md text-sm transition-colors ${
                            isItemFromDb
                              ? 'bg-surface/70 text-ink cursor-default font-medium'
                              : 'bg-surface text-ink focus:ring-2 focus:ring-accent'
                          }`}
                          placeholder="08123456789"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Button Tambah PIC */}
            <button
              type="button"
              onClick={handleAddPic}
              className="w-full py-2.5 px-3 border border-dashed border-accent/60 hover:border-accent hover:bg-accent/5 text-accent rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>+ Tambah PIC Lainnya</span>
            </button>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-end">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">Status Event *</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm font-medium"
              >
                <option value="new">NEW</option>
                <option value="reschedule">RESCHEDULE</option>
                <option value="pending">PENDING</option>
                <option value="completed">COMPLETED</option>
              </select>
            </div>

            <div className="flex items-center h-[38px] px-3.5 border border-line rounded-md bg-bg hover:bg-orange-50/50 transition-colors">
              <label className="flex items-center gap-2 cursor-pointer select-none w-full">
                <input
                  type="checkbox"
                  {...register('isHighPriority')}
                  className="rounded border-line text-[#FF4D00] focus:ring-[#FF4D00] w-4 h-4 cursor-pointer accent-[#FF4D00]"
                />
                <span className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-[#FF4D00]" />
                  Priority Event
                </span>
              </label>
            </div>
          </div>

          {/* Reminders */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-2 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-accent" /> Jadwal Reminder Email PIC
            </label>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
              {['H-7', 'H-3', 'H-1', 'Hari H'].map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer font-medium text-ink">
                  <input
                    type="checkbox"
                    value={item}
                    {...register('reminders')}
                    className="rounded border-line text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                  />
                  {item}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-ink-soft mt-1.5 flex items-center gap-1">
              <span>💡 Pengingat otomatis terkirim jam 07:00 pagi. Khusus Hari H dikirim jam 07:00 pagi & H-1 jam sebelum acara.</span>
            </p>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">Deskripsi / Detail Kegiatan</label>
            <textarea
              rows={3}
              {...register('deskripsi')}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              placeholder="Tambahkan catatan atau instruksi khusus..."
            ></textarea>
          </div>

          {/* Notulensi & Hasil Kegiatan */}
          <div className="p-3.5 sm:p-4 border border-line/80 rounded-xl bg-bg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <FileText size={15} className="text-accent" /> Notulensi & Hasil Kegiatan
              </h3>
              <span className="text-[11px] text-ink-soft bg-surface px-2 py-0.5 rounded border border-line/50">Opsional / Pasca Acara</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Catatan Notulensi / Hasil Pembahasan
              </label>
              <textarea
                rows={4}
                {...register('notulensi')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-surface text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                placeholder="Catat ringkasan pembahasan rapat, kesepakatan, temuan, atau tindak lanjut kegiatan..."
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1.5">
                <LinkIcon size={13} className="text-accent" /> Link Dokumen / Foto Dokumentasi
              </label>
              <input
                type="url"
                {...register('notulensiLink')}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-surface text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                placeholder="https://drive.google.com/... (Google Drive, Dropbox, atau tautan dokumentasi)"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-line flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-line rounded-md text-sm font-medium text-ink hover:bg-bg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-navy-deep hover:bg-ink text-surface rounded-md text-sm font-medium transition-colors cursor-pointer shadow-xs"
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
