import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Mail, Phone, Briefcase, CheckCircle } from 'lucide-react';
import { useEventStore } from '../../store/eventStore';

const picSchema = z.object({
  nama: z.string().min(2, 'Nama PIC minimal 2 karakter'),
  email: z.string().email('Email perusahaan tidak valid'),
  noTelp: z.string().optional(),
  departemen: z.string().min(2, 'Departemen / Jabatan harus diisi'),
  status: z.enum(['aktif', 'nonaktif'])
});

export default function PicFormModal({ initialData, onClose }) {
  const { addPic, updatePic } = useEventStore();
  const isEditing = !!initialData;

  const defaultValues = isEditing
    ? {
      nama: initialData.nama || '',
      email: initialData.email || '',
      noTelp: initialData.noTelp || '',
      departemen: initialData.departemen || '',
      status: initialData.status || 'aktif'
    }
    : {
      nama: '',
      email: '',
      noTelp: '',
      departemen: 'HSE / Safety Patrol',
      status: 'aktif'
    };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(picSchema),
    defaultValues
  });

  const onSubmit = (data) => {
    if (isEditing) {
      updatePic(initialData.id, data);
    } else {
      addPic(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-surface rounded-xl max-w-lg w-full border border-line shadow-xl overflow-hidden my-auto sm:my-8 flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-line flex items-center justify-between bg-bg shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-ink">
            {isEditing ? 'Edit Data PIC' : 'Tambah Person In Charge (PIC) Baru'}
          </h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors p-1 rounded-md shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Nama PIC */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <User size={14} className="text-accent" /> Nama Lengkap PIC *
            </label>
            <input
              type="text"
              {...register('nama')}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              placeholder="Contoh: Citra Rahmawati"
            />
            {errors.nama && <p className="text-xs text-pending mt-1">{errors.nama.message}</p>}
          </div>

          {/* Email Perusahaan */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Mail size={14} className="text-accent" /> Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              placeholder="citra@safety.local"
            />
            {errors.email && <p className="text-xs text-pending mt-1">{errors.email.message}</p>}
          </div>

          {/* No. Telepon */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Phone size={14} className="text-accent" /> No. Telepon / WhatsApp
            </label>
            <input
              type="text"
              {...register('noTelp')}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              placeholder="08123456789"
            />
          </div>

          {/* Departemen / Jabatan */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Briefcase size={14} className="text-accent" /> Departemen / Jabatan *
            </label>
            <input
              type="text"
              {...register('departemen')}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              placeholder="Contoh: HSE Officer / Inspector"
            />
            {errors.departemen && <p className="text-xs text-pending mt-1">{errors.departemen.message}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-accent" /> Status PIC *
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm font-medium"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
            </select>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-line flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-line rounded-md text-sm font-medium text-ink hover:bg-bg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-navy-deep hover:bg-ink text-surface rounded-md text-sm font-medium transition-colors"
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah PIC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
