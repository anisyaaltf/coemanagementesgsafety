import { useState } from 'react';
import { Plus, Search, UserCheck, Users, Mail, Phone, Edit3, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { useEventStore } from '../../store/eventStore';
import PicFormModal from '../../components/pic/PicFormModal';

export default function PicPage() {
  const { pics, events, deletePic } = useEventStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPic, setEditingPic] = useState(null);

  // Filter PICs
  const filteredPics = pics.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.nama.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.departemen?.toLowerCase().includes(query) ||
      p.noTelp?.includes(query)
    );
  });

  // Calculate stats
  const totalPics = pics.length;
  const activePics = pics.filter((p) => p.status === 'aktif').length;
  
  // Count how many events each PIC is assigned to
  const getPicEventCount = (picObj) => {
    return events.filter((e) =>
      e.pic?.some((p) => p.id === picObj.id || p.email === picObj.email || p.nama === picObj.nama)
    ).length;
  };

  const handleDelete = (pic) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus PIC "${pic.nama}"?`)) {
      deletePic(pic.id);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs text-ink-soft">Total Person In Charge (PIC)</div>
            <div className="text-2xl font-bold text-ink">{totalPics}</div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-new/10 text-new rounded-lg">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-xs text-ink-soft">PIC Status Aktif</div>
            <div className="text-2xl font-bold text-ink">{activePics}</div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-navy-deep/10 text-navy-deep rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-xs text-ink-soft">Departemen K3 & Safety</div>
            <div className="text-2xl font-bold text-ink">4 Area</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-surface p-4 rounded-lg border border-line shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Cari nama, email, departemen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-line rounded-md bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>

        {/* Add PIC Button */}
        <button
          onClick={() => {
            setEditingPic(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-navy-deep text-surface hover:bg-ink px-4 py-2 rounded-md font-medium text-sm transition-colors shrink-0"
        >
          <Plus size={18} /> + Tambah PIC Baru
        </button>
      </div>

      {/* PIC List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPics.length === 0 ? (
          <div className="col-span-full bg-surface p-8 text-center rounded-lg border border-line text-ink-soft text-sm">
            Tidak ada data PIC yang ditemukan. Silakan tambah PIC baru.
          </div>
        ) : (
          filteredPics.map((pic) => {
            const eventCount = getPicEventCount(pic);
            return (
              <div
                key={pic.id}
                className="bg-surface border border-line rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-navy-deep text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                        {getInitials(pic.nama)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink text-base">{pic.nama}</h3>
                        <div className="text-xs text-ink-soft font-medium">{pic.departemen || 'General Safety'}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        pic.status === 'aktif' ? 'bg-new/15 text-new' : 'bg-line text-ink-soft'
                      }`}
                    >
                      {pic.status || 'aktif'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-ink-soft border-t border-line/60 pt-3">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-accent shrink-0" />
                      <a href={`mailto:${pic.email}`} className="hover:underline text-ink font-medium truncate">
                        {pic.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-accent shrink-0" />
                      <span>{pic.noTelp || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-accent shrink-0" />
                      <span>
                        Assigned to: <strong className="text-ink">{eventCount} Event</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-line/60 pt-3">
                  <button
                    onClick={() => {
                      setEditingPic(pic);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-medium bg-bg hover:bg-line text-ink px-3 py-1.5 rounded-md transition-colors border border-line"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pic)}
                    className="flex items-center gap-1 text-xs font-medium bg-pending/10 text-pending hover:bg-pending hover:text-white px-3 py-1.5 rounded-md transition-colors border border-pending/20"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <PicFormModal
          initialData={editingPic}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPic(null);
          }}
        />
      )}
    </div>
  );
}
