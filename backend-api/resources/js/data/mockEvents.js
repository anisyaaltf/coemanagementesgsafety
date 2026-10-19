export const mockEvents = [
  {
    id: '1',
    judul: 'Safety Patrol',
    tanggalMulai: '2026-09-02',
    tanggalSelesai: '2026-09-02',
    waktuMulai: '13:00',
    waktuSelesai: '15:00',
    timezone: 'Asia/Jakarta',
    lokasi: {
      nama: 'Area Casting',
      link: 'https://maps.google.com'
    },
    pic: [
      {
        id: 'p1',
        nama: 'Citra',
        email: 'citra@safety.local',
        noTelp: '08123456789'
      }
    ],
    deskripsi: 'Inspeksi rutin harian di area casting.',
    status: 'new', // new, updated, pending, completed
    priority: 'priority',
  },
  {
    id: '2',
    judul: 'Safety Meeting',
    tanggalMulai: '2026-09-03',
    tanggalSelesai: '2026-09-03',
    waktuMulai: '08:00',
    waktuSelesai: '10:00',
    timezone: 'Asia/Jakarta',
    lokasi: {
      nama: 'Meeting Room',
      link: ''
    },
    pic: [
      {
        id: 'p2',
        nama: 'Andi',
        email: 'andi@safety.local',
        noTelp: '08111222333'
      },
      {
        id: 'p3',
        nama: 'Budi',
        email: 'budi@safety.local',
        noTelp: '08999888777'
      }
    ],
    deskripsi: 'Meeting bulanan HSE.',
    status: 'reschedule',
    priority: 'priority',
  },
  {
    id: '3',
    judul: 'Training K3',
    tanggalMulai: '2026-09-03',
    tanggalSelesai: '2026-09-03',
    waktuMulai: '09:00',
    waktuSelesai: '12:00',
    timezone: 'Asia/Jakarta',
    lokasi: {
      nama: 'Training Center',
      link: ''
    },
    pic: [
      {
        id: 'p4',
        nama: 'Deni',
        email: 'deni@safety.local',
        noTelp: '081333444555'
      }
    ],
    deskripsi: 'Training K3 untuk karyawan baru.',
    status: 'pending',
    priority: 'standard',
  },
  {
    id: '4',
    judul: 'Audit Eksternal',
    tanggalMulai: '2026-09-05',
    tanggalSelesai: '2026-09-06',
    waktuMulai: '09:00',
    waktuSelesai: '16:00',
    timezone: 'Asia/Jakarta',
    lokasi: {
      nama: 'All Area',
      link: ''
    },
    pic: [
      {
        id: 'p1',
        nama: 'Citra',
        email: 'citra@safety.local',
        noTelp: '08123456789'
      }
    ],
    deskripsi: 'Audit HSE tahunan.',
    notulensi: 'Audit selesai dilaksanakan dengan hasil kepatuhan 94%. Terdapat 3 temuan minor terkait pembaruan label APAR di area Workshop dan telah disepakati batas waktu perbaikan hingga 15 Oktober 2026.',
    notulensiLink: 'https://docs.google.com',
    status: 'completed',
    priority: 'standard',
  }
];
