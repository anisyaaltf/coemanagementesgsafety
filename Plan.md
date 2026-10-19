# Plan.md — Kalender Event (Sistem Reminder)

## 1. Ringkasan Proyek

Tahap ini fokus membangun **satu modul utama: Kalender Event (Calendar of Event/COE)** untuk mengelola agenda kegiatan secara terpusat dan memberikan reminder kepada PIC melalui **email perusahaan**.

Sistem memiliki dua area akses:

1. **Public COE** — dapat diakses tanpa login untuk melihat kalender event dan daftar prioritas kegiatan secara read-only.
2. **Management Area** — membutuhkan login untuk melakukan pengelolaan event, PIC, reminder, notifikasi, dan data lainnya.

Sistem digunakan untuk:
- Mencatat agenda kegiatan.
- Menentukan tanggal dan waktu pelaksanaan menggunakan **WIB (UTC+7)**.
- Menentukan lokasi kegiatan beserta link lokasi.
- Menentukan satu atau lebih PIC.
- Menyimpan data PIC berupa nama, email, dan nomor telepon.
- Menentukan prioritas kegiatan.
- Mengirimkan reminder kegiatan kepada PIC melalui email.
- Menampilkan status dan kondisi event secara visual.
- Menampilkan daftar kegiatan berdasarkan prioritas.
- Mencatat siapa yang membuat dan memperbarui event.
- Menampilkan histori perubahan event.

Modul lain seperti **pengecekan APAR** dan **perpanjangan izin proyek** ditunda untuk fase berikutnya.

---

## 2. Access Model

### 2.1 Public Access

Public user tidak perlu login untuk:

- Membuka Calendar of Event.
- Melihat event dalam Month / Week / Day / List.
- Melihat nama kegiatan.
- Melihat tanggal dan waktu.
- Melihat lokasi dan link lokasi.
- Melihat **nama PIC**.
- Melihat status event.
- Melihat **prioritas kegiatan**.
- Membuka daftar **Prioritas Kegiatan**.

Public access bersifat **read-only**.

Public user tidak dapat:
- Menambah event.
- Mengubah event.
- Menghapus event.
- Mengubah status event.
- Mengubah prioritas event.
- Mengelola PIC.
- Mengatur reminder.
- Melihat email atau nomor telepon PIC.
- Melihat creator/updater internal.
- Melihat activity history internal.
- Membuka fitur management.

### 2.2 Authenticated Access

User yang login dapat mengakses seluruh fitur management sesuai authorization.

Fitur authenticated:
- Dashboard.
- Calendar Management.
- Prioritas Kegiatan Management.
- Tambah event.
- Edit event.
- Delete event.
- Mark as Completed.
- Mark as Pending.
- Kelola priority.
- Kelola PIC.
- Reminder.
- Notification Center.
- Event History.
- Pengaturan.

---

## 3. Current Phase

**Frontend + database preparation**

Frontend dibuat menggunakan React dan dapat menggunakan mock data/service layer selama backend Laravel belum diimplementasikan.

Database MySQL dapat dipersiapkan dan dikelola menggunakan **DBeaver**.

DBeaver digunakan sebagai database client/management tool, bukan sebagai database engine.

Backend Laravel, authentication perusahaan, email server, scheduler, dan integrasi email aktual dibuat pada fase backend.

Frontend harus dirancang **API-ready**, sehingga nantinya dapat dihubungkan dengan backend Laravel tanpa melakukan perubahan besar pada UI.

---

# 4. Tech Stack

## Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- date-fns
- Zustand atau Context API
- lucide-react

## Calendar

Gunakan library kalender React yang mendukung:
- Month view
- Week view
- Day view
- List view
- Event click
- Event color/status
- Date navigation

**Rekomendasi:** FullCalendar React.

## Form

Gunakan:
- React Hook Form
- Zod

untuk validasi form event dan PIC.

## Data

Frontend dapat menggunakan:
- Mock data
- Local state / Zustand
- Mock service layer

Jangan membuat backend Laravel pada fase frontend.

---

# 5. Arsitektur Frontend

```text
src/
│
├── components/
│   ├── ui/
│   ├── calendar/
│   ├── event/
│   ├── pic/
│   ├── notification/
│   ├── priority/
│   └── common/
│
├── layouts/
│   ├── PublicLayout.jsx
│   └── AppShell.jsx
│
├── pages/
│   ├── PublicCalendar.jsx
│   ├── PublicPriority.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   │
│   ├── calendar/
│   │   ├── CalendarPage.jsx
│   │   ├── EventForm.jsx
│   │   ├── EventDetail.jsx
│   │   └── EventHistory.jsx
│   │
│   ├── priority/
│   │   └── PriorityPage.jsx
│   │
│   ├── pic/
│   │   ├── PicPage.jsx
│   │   ├── PicForm.jsx
│   │   └── PicDetail.jsx
│   │
│   └── settings/
│       └── Settings.jsx
│
├── data/
│   ├── mockEvents.js
│   ├── mockPics.js
│   └── mockUsers.js
│
├── lib/
│   ├── date.js
│   ├── status.js
│   └── reminder.js
│
├── services/
│   ├── eventService.js
│   ├── picService.js
│   └── notificationService.js
│
├── store/
│   ├── authStore.js
│   └── eventStore.js
│
└── styles/
    └── tokens.css
```

---

# 6. Design System

Arah visual:

**Modern Industrial Safety Management System**

UI harus terlihat:
- Professional
- Clean
- Corporate
- Modern
- Operational
- Mudah digunakan
- Tidak terlalu dekoratif

Hindari:
- AI-style generic UI
- Neon
- Glassmorphism berlebihan
- Gradient berlebihan
- Animasi berlebihan

---

# 7. Color System

Gunakan CSS variables.

| Token | Hex | Peran |
|---|---|---|
| `--color-bg` | `#F6F7F5` | Background |
| `--color-surface` | `#FFFFFF` | Card/panel |
| `--color-ink` | `#132436` | Text utama |
| `--color-ink-soft` | `#5B6B7A` | Text sekunder |
| `--color-line` | `#DCE1E3` | Border |
| `--color-accent` | `#DE9A34` | Highlight |
| `--color-new` | `#2F7D5A` | Event baru |
| `--color-update` | `#C97A1F` | Event diperbarui |
| `--color-pending` | `#B3432F` | Pending |
| `--color-navy-deep` | `#0E1D2E` | Sidebar |

Priority dapat memiliki visual tersendiri, tetapi jangan membuat warna priority menggantikan warna status event.

---

# 8. Event Color Rules

## Event Baru

Ketika kegiatan baru ditambahkan:

**Hijau**

```text
NEW EVENT
```

## Event Updated

Ketika event diperbarui:

**Kuning / Amber**

```text
UPDATED
```

Perubahan dapat berupa:
- Nama kegiatan
- Tanggal
- Waktu
- Lokasi
- PIC
- Deskripsi
- Reminder
- Priority

## Event Pending

Jika kegiatan memiliki status Pending:

**Merah**

```text
PENDING
```

## Completed

Gunakan status:

**Completed**

Status ini menunjukkan kegiatan sudah selesai dilaksanakan.

Gunakan visual yang berbeda dari event baru/update/pending agar status tidak membingungkan.

---

# 9. Priority Rules

Priority adalah konsep yang berbeda dari status event.

## Priority

Gunakan:

```text
HIGH
MEDIUM
LOW
```

Contoh:

```text
Safety Patrol
Status   : NEW
Priority : HIGH
```

Priority digunakan untuk menentukan kegiatan mana yang perlu lebih diperhatikan.

**PENDING tidak sama dengan HIGH PRIORITY.**

Event dapat memiliki kombinasi:

```text
Status   : PENDING
Priority : MEDIUM
```

atau:

```text
Status   : NEW
Priority : HIGH
```

Priority dapat digunakan pada:
- Public Priority List
- Dashboard
- Calendar indicator
- Search/filter
- Event Detail
- Management

---

# 10. Timezone

Semua tanggal dan waktu kegiatan menggunakan:

> **WIB / UTC+7**

Frontend harus menampilkan:

```text
WIB
```

Contoh:

```text
20 Agustus 2026
08:00 WIB - 09:00 WIB
```

Jangan menggunakan timezone browser pengguna sebagai timezone utama event.

Untuk helper date:

```text
lib/date.js
```

Siapkan fungsi:
- `formatDateWIB()`
- `formatTimeWIB()`
- `formatDateTimeWIB()`
- `getDaysUntilEvent()`

Semua event menggunakan:

```text
Asia/Jakarta
```

---

# 11. Public Application Layout

Public area tidak menggunakan sidebar management.

Contoh:

```text
┌─────────────────────────────────────────────────────┐
│ COE / Calendar of Event                    [Login] │
├─────────────────────────────────────────────────────┤
│                                                     │
│       Calendar of Event                             │
│                                                     │
│       [ Kalender Event ] [ Prioritas Kegiatan ]     │
│                                                     │
│       Public Read Only                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Public navigation:
- Kalender Event
- Prioritas Kegiatan
- Login

---

# 12. Management Application Layout

Setelah login:

```text
┌──────────────┬──────────────────────────────────────────┐
│              │ Topbar                                   │
│   Sidebar    ├──────────────────────────────────────────┤
│              │                                          │
│ Dashboard    │             Main Content                 │
│ Kalender     │                                          │
│ Prioritas    │                                          │
│ PIC          │                                          │
│ Notifikasi   │                                          │
│ Pengaturan   │                                          │
│              │                                          │
│ APAR         │                                          │
│ Segera Hadir │                                          │
│ Izin Proyek  │                                          │
│ Segera Hadir │                                          │
└──────────────┴──────────────────────────────────────────┘
```

Sidebar menu:

```text
Dashboard
Kalender Event
Prioritas Kegiatan
PIC
Notifikasi
Pengaturan

APAR
Segera Hadir

Izin Proyek
Segera Hadir
```

APAR dan Izin Proyek hanya placeholder.

Jangan membuat modul tersebut.

---

# 13. Routing

Gunakan route berikut:

## Public

```text
/                   → Public Calendar
/prioritas          → Public Priority List
/login              → Login
```

## Protected

```text
/dashboard
/kalender
/kalender/:id
/prioritas/manage
/pic
/notifikasi
/pengaturan
```

Route protected harus mengharuskan user login.

Jika user yang belum login mencoba membuka route protected:

```text
Protected Route
      ↓
Not Authenticated
      ↓
/login
```

Setelah login berhasil, user dapat diarahkan ke halaman yang diminta atau `/dashboard`.

---

# 14. Authentication

Frontend phase menggunakan mock authentication.

Login menggunakan:
- Email perusahaan
- Password

Contoh mock:

```text
admin@safety.local
password
```

Authentication state harus disimpan melalui auth store.

Public Calendar dan Public Priority tidak memerlukan authentication.

Management membutuhkan authentication.

Backend authentication perusahaan belum dibuat pada frontend phase.

Pada fase backend, authentication dan authorization ditangani oleh Laravel.

---

# 15. Public Calendar

Route:

```text
/
```

Public Calendar adalah halaman yang dapat dibuka tanpa login.

Tampilan:
- Month
- Week
- Day
- List

Toolbar:

```text
< Prev
Today
Next >

Month | Week | Day | List

[Search...]
[Filter]
```

Public Calendar bersifat read-only.

Public dapat melihat:
- Nama kegiatan
- Tanggal
- Waktu
- WIB
- Lokasi
- Link lokasi
- Nama PIC
- Status
- Priority

Public tidak dapat:
- Add
- Edit
- Delete
- Mark status
- Mengubah priority
- Mengubah reminder

Tombol management seperti `+ Tambah Event` tidak ditampilkan pada public calendar.

---

# 16. Public Priority List

Route:

```text
/prioritas
```

Halaman menampilkan daftar kegiatan yang membutuhkan perhatian berdasarkan priority.

Contoh:

```text
PRIORITAS KEGIATAN

HIGH PRIORITY
────────────────────────────────
Safety Patrol
Hari ini · 13:00 WIB
Lokasi: Area Casting
PIC: Citra

HIGH PRIORITY
────────────────────────────────
Safety Meeting
Besok · 08:00 WIB
Lokasi: Meeting Room
PIC: Andi, Budi

MEDIUM PRIORITY
────────────────────────────────
Training K3
3 September 2026 · 09:00 WIB
PIC: Deni
```

Urutan default:
1. HIGH
2. MEDIUM
3. LOW

Di dalam priority yang sama, event terdekat ditampilkan lebih dahulu.

Public dapat melihat:
- Judul event
- Tanggal
- Waktu
- Lokasi
- Nama PIC
- Status
- Priority

Public tidak dapat mengubah data.

---

# 17. Dashboard

Dashboard menampilkan ringkasan COE.

## KPI

```text
Total Event
Event Hari Ini
Upcoming Event
Pending Event
Completed Event
High Priority Event
```

## Event Terdekat

Contoh:

```text
EVENT TERDEKAT

🟡 Safety Meeting
Besok · 08:00 WIB
PIC: Andi, Budi

🔴 Safety Patrol
Hari ini · 13:00 WIB
PIC: Citra
```

## Priority Summary

Tambahkan ringkasan:

```text
HIGH       3
MEDIUM     7
LOW        5
```

---

# 18. Calendar Management

Route:

```text
/kalender
```

Halaman utama management.

Tampilan:
- Month
- Week
- Day
- List

Toolbar:

```text
< Prev
Today
Next >

Month | Week | Day | List

[Search...]

[Status]
[Priority]
[PIC]
[Date Range]

[+ Tambah Event]
```

Filter dapat digunakan bersamaan.

---

# 19. Event Data

Event memiliki struktur:

```js
{
  id: string,

  judul: string,

  tanggalMulai: string,
  tanggalSelesai: string,

  waktuMulai: string,
  waktuSelesai: string,

  timezone: "Asia/Jakarta",

  lokasi: {
    nama: string,
    link: string
  },

  pic: [
    {
      id: string,
      nama: string,
      email: string,
      noTelp: string
    }
  ],

  deskripsi: string,

  status: "new" | "updated" | "pending" | "completed",

  priority: "high" | "medium" | "low",

  dibuatOleh: {
    id: string,
    nama: string,
    email: string
  },

  dibuatPada: string,

  diperbaruiOleh: {
    id: string,
    nama: string
  },

  diperbaruiPada: string,

  reminders: [
    {
      type: "H-7" | "H-3" | "H-1" | "Hari H",
      enabled: boolean
    }
  ],

  history: []
}
```

---

# 20. Create Event Flow

```text
Tambah Event
     │
     ▼
Input Nama Kegiatan
     │
     ▼
Input Tanggal Pelaksanaan
     │
     ▼
Input Waktu Mulai & Selesai
     │
     ▼
Input Lokasi
     │
     ├── Nama Lokasi
     └── Link Lokasi
     │
     ▼
Pilih / Tambah PIC
     │
     ▼
Tentukan Priority
     │
     ▼
Set Reminder
     │
     ▼
Review Data
     │
     ▼
Simpan Event
     │
     ▼
Event Berhasil Dibuat
     │
     ▼
Event Muncul di Kalender
     │
     ▼
Reminder Dijadwalkan
```

---

# 21. Event Form

Form dibagi menjadi beberapa section.

## Section 1 — Informasi Kegiatan

Fields:
- Nama Kegiatan — Required
- Tanggal Pelaksanaan — Required
- Waktu Mulai — Required
- Waktu Selesai — Required
- Priority — Required

Gunakan WIB.

Validation:

```text
Waktu selesai harus lebih besar
dari waktu mulai.
```

Priority:

```text
High
Medium
Low
```

---

# 22. Section 2 — Lokasi

Fields:

### Nama Lokasi

Contoh:

```text
Area Casting
```

### Link Lokasi

Contoh:

```text
https://maps.google.com/...
```

Link harus dapat diklik dari detail event.

---

# 23. Section 3 — PIC

PIC dapat berjumlah lebih dari satu.

```text
PIC

[ Select PIC ]

+ Tambah PIC
```

Data PIC:
- Nama
- Email
- Nomor telepon

Public hanya menampilkan **nama PIC**.

Email dan nomor telepon hanya dapat dilihat oleh authenticated user.

---

# 24. PIC Management

Jika PIC sudah tersedia:

```text
Select PIC
```

Data otomatis terisi:
- Nama
- Email
- Nomor telepon

Jika PIC belum tersedia:

```text
+ Tambah PIC Baru
```

Form:
- Nama PIC
- Email
- Nomor Telepon

Setelah disimpan, PIC dapat langsung dipilih untuk event.

---

# 25. Update PIC

PIC dapat diperbarui melalui menu:

```text
PIC
```

User dapat:
- Edit nama
- Edit email
- Edit nomor telepon
- Nonaktifkan PIC

Jika data PIC berubah:

> Data PIC terbaru digunakan pada event yang menggunakan PIC tersebut.

Jangan menghapus PIC secara permanen jika sudah digunakan oleh histori event.

Gunakan status:

```text
Active
Inactive
```

---

# 26. Multiple PIC

Satu event dapat memiliki banyak PIC.

Contoh:

```text
Safety Meeting

PIC:
- Andi
- Budi
- Citra
```

Semua PIC akan menjadi penerima reminder email.

---

# 27. Reminder

Reminder default:

```text
H-7
H-3
H-1
Hari H
```

User dapat mengaktifkan/nonaktifkan reminder:

```text
☑ H-7
☑ H-3
☑ H-1
☑ Hari H
```

Reminder berlaku untuk seluruh PIC yang terdaftar pada event.

---

# 28. Notification Channel

Untuk fase ini:

## Email

Notification dikirim ke:

```text
Email PIC
```

Frontend hanya menyediakan konfigurasi dan preview.

Pengiriman email aktual dilakukan oleh backend pada fase berikutnya.

---

# 29. Email Reminder Preview

Buat UI preview email:

```text
┌─────────────────────────────────────────┐
│ Reminder Calendar of Event              │
├─────────────────────────────────────────┤
│ Yth. PIC,                               │
│                                         │
│ Reminder kegiatan:                      │
│ Safety Meeting                          │
│ 20 Agustus 2026                         │
│ 08:00 - 09:00 WIB                       │
│ Area Casting                            │
│                                         │
│ PIC: Andi, Budi                         │
│                                         │
│ Mohon memastikan kegiatan               │
│ dilaksanakan sesuai jadwal.             │
└─────────────────────────────────────────┘
```

---

# 30. Event Update

Jika event diperbarui:

```text
Event Existing
      │
      ▼
Edit Event
      │
      ▼
Ubah Data
      │
      ▼
Simpan
      │
      ▼
Status = UPDATED
      │
      ▼
Warna Event = KUNING
      │
      ▼
Create History Record
```

History harus menyimpan:
- Field yang berubah
- Nilai sebelum
- Nilai sesudah
- User yang mengubah
- Waktu perubahan

---

# 31. Event Pending

Jika event berstatus pending:

```text
Status = PENDING
```

Event ditampilkan merah.

Pending tidak otomatis berarti High Priority.

---

# 32. Event History

Pada detail event tampilkan:

```text
Riwayat Perubahan

19 Aug 2026 10:30
Budi

Mengubah:
Waktu

08:00 → 09:00

────────────────

18 Aug 2026 14:20
Andi

Mengubah:
PIC

Andi → Andi, Budi
```

---

# 33. Event Creator

Setiap event harus menampilkan:

```text
Dibuat oleh:
Nama User

Tanggal dibuat:
19 Agustus 2026, 09:30 WIB
```

Creator hanya ditampilkan pada management/detail authenticated.

---

# 34. Event Detail

Route:

```text
/kalender/:id
```

Detail authenticated:
- Nama Kegiatan
- Status
- Priority
- Tanggal
- Waktu
- Lokasi
- Link Lokasi
- PIC
- Email PIC
- Nomor telepon PIC
- Reminder
- Dibuat oleh
- Diperbarui oleh
- Riwayat Perubahan

Actions:
- Edit
- Delete
- Mark as Completed
- Mark as Pending
- Change Priority

Public detail jika tersedia hanya boleh menampilkan informasi public:
- Nama Kegiatan
- Status
- Priority
- Tanggal
- Waktu
- Lokasi
- Link Lokasi
- Nama PIC

---

# 35. Search & Filter

Calendar memiliki:

## Search

Cari berdasarkan:
- Nama kegiatan
- Lokasi
- PIC

## Filter

- Status
- Priority
- PIC
- Date range

Filter harus dapat digunakan bersamaan.

Public search/filter tidak boleh membuka data internal.

---

# 36. List View

List view management menampilkan:

| Event | Tanggal | Waktu | Lokasi | PIC | Priority | Status | Dibuat Oleh |
|---|---|---|---|---|---|---|---|

Public list view tidak menampilkan:
- Email PIC
- Nomor telepon PIC
- Creator
- Updater
- Internal history

---

# 37. Notification Center

Route:

```text
/notifikasi
```

Menampilkan:
- Reminder event
- Event updated
- Event pending
- Event completed
- High priority event

Untuk frontend, gunakan mock notification.

---

# 38. Status Helper

Buat:

```text
lib/status.js
```

Helper:
- `getEventStatus()`
- `getEventColor()`
- `getEventLabel()`

Status:

```text
NEW
UPDATED
PENDING
COMPLETED
```

Status workflow harus dibedakan dari:
- Priority
- Overdue
- Waktu event

---

# 39. Priority Helper

Buat helper jika diperlukan:

```text
lib/priority.js
```

Helper:
- `getPriorityLabel()`
- `getPriorityColor()`
- `getPriorityOrder()`

Priority:

```text
HIGH
MEDIUM
LOW
```

Default sorting:

```text
HIGH → MEDIUM → LOW
```

Untuk priority yang sama:

```text
event paling dekat → event lebih jauh
```

---

# 40. Mock Data

Buat minimal:
- 15–20 Events
- 10 PIC
- 5 Users
- 10 Activity Logs

Event harus memiliki variasi:
- New
- Updated
- Pending
- Completed
- Upcoming
- Today
- High Priority
- Medium Priority
- Low Priority

Mock data harus cukup untuk menguji:
- Public Calendar
- Public Priority List
- Dashboard
- Search
- Filter
- Multiple PIC
- Event status
- Priority sorting

---

# 41. Mock Service

Buat:

```text
services/
├── eventService.js
├── picService.js
└── notificationService.js
```

Contoh:

```js
eventService.createEvent()
eventService.updateEvent()
eventService.deleteEvent()
eventService.getEvents()
eventService.getPriorityEvents()
```

Saat ini service menggunakan mock data.

Nantinya dapat diganti menjadi:

```text
React
   ↓
Axios
   ↓
Laravel API
   ↓
MySQL
```

tanpa mengubah UI utama.

---

# 42. Database

Database utama menggunakan **MySQL**.

Database dapat dibuat dan dikelola melalui **DBeaver**.

Struktur database minimal perlu mendukung:
- User
- Event
- PIC
- Relasi multiple PIC
- Reminder
- Activity Log
- Priority event

Arsitektur konseptual:

```text
users
  │
  ├───────────────┐
  │               │
  ▼               ▼
events         activity_logs
  │
  ├── event_pics ── PIC
  │
  └── reminders
```

Gunakan foreign key dan relasi yang konsisten.

Jangan menghapus data PIC secara permanen jika PIC sudah digunakan oleh event/history.

`schema.sql` menjadi sumber struktur database yang akan divalidasi sebelum integrasi Laravel.

Jangan membuat struktur database yang bertentangan dengan requirement di Plan.md.

---

# 43. Pengaturan

Route:

```text
/pengaturan
```

Tampilkan:

## Reminder Default

```text
☑ H-7
☑ H-3
☑ H-1
☑ Hari H
```

## Email

```text
Notification Channel

✓ Email
```

Frontend hanya menampilkan konfigurasi.

Email aktual dilakukan backend.

---

# 44. Placeholder Future Module

Sidebar:

```text
APAR
Segera Hadir

Izin Proyek
Segera Hadir
```

Jika diklik, tampilkan halaman "Segera Hadir".

Jangan membangun fitur APAR dan Izin Proyek.

---

# 45. Alur Utama Sistem

## Public Flow

```text
USER
  │
  ▼
PUBLIC COE
  │
  ├───────────────┐
  │               │
  ▼               ▼
KALENDER       PRIORITAS
EVENT          KEGIATAN
  │               │
  └───────┬───────┘
          │
          ▼
     READ ONLY
          │
          ▼
       [LOGIN]
          │
          ▼
      DASHBOARD
          │
          ▼
MANAGEMENT COE
```

## Management Flow

```text
LOGIN
  │
  ▼
DASHBOARD
  │
  ▼
KALENDER EVENT
  │
  ▼
+ TAMBAH EVENT
  │
  ▼
INPUT KEGIATAN
  │
  ▼
INPUT TANGGAL & WAKTU WIB
  │
  ▼
INPUT LOKASI + LINK
  │
  ▼
PILIH / TAMBAH PIC
  │
  ▼
TENTUKAN PRIORITY
  │
  ▼
SET REMINDER
  │
  ▼
SIMPAN EVENT
  │
  ▼
EVENT MUNCUL DI KALENDER
  │
  ▼
REMINDER TERJADWAL
  │
  ▼
BACKEND MENGIRIM EMAIL
  │
  ▼
PIC MENERIMA REMINDER
  │
  ▼
KEGIATAN DILAKSANAKAN
  │
  ▼
UPDATE STATUS
  │
  ▼
HISTORY TERCATAT
```

---

# 46. Flow Update Event

```text
Pilih Event
    │
    ▼
Edit Event
    │
    ▼
Ubah Data
    │
    ▼
Simpan
    │
    ▼
Event Berwarna Kuning
    │
    ▼
History Perubahan Dibuat
    │
    ▼
Dibuat Oleh / Diperbarui Oleh
Tercatat
```

---

# 47. Rencana Build

## Phase 1 — Setup
- React + Vite
- Tailwind
- Routing
- Design tokens
- Font
- Folder structure

## Phase 2 — Public Access
- Public layout
- Public Calendar
- Public Priority List
- Read-only event display
- Public navigation
- Login button

## Phase 3 — Authentication
- Mock login
- Auth store
- Protected route
- Redirect unauthenticated user

## Phase 4 — AppShell
- Sidebar
- Topbar
- Responsive layout
- User menu

## Phase 5 — Dashboard
- KPI
- Upcoming events
- Reminder
- Event status
- Priority summary

## Phase 6 — Calendar
- FullCalendar
- Month
- Week
- Day
- List
- Search
- Filter
- Priority indicator

## Phase 7 — Event Form
- Event information
- Date/time WIB
- Location
- Location link
- Multiple PIC
- Priority
- Reminder

## Phase 8 — PIC Management
- PIC list
- Add PIC
- Edit PIC
- Active/inactive
- Multiple PIC selection

## Phase 9 — Event Detail
- Event detail
- Edit
- Delete
- Status
- Priority
- Creator
- Update history

## Phase 10 — Notification
- Notification center
- Reminder preview
- Email preview
- Mock notification

## Phase 11 — Database Preparation
- MySQL database
- schema.sql
- Table validation
- Foreign key validation
- Multiple PIC relation
- Reminder relation
- Activity log relation

## Phase 12 — Polish
- Responsive
- Accessibility
- Empty state
- Loading state
- Error state
- Toast
- Final UI review

---

# 48. Definition of Done

Frontend dianggap selesai apabila:

### Public
- [ ] User dapat membuka Calendar of Event tanpa login.
- [ ] User dapat melihat event secara read-only.
- [ ] User dapat melihat Month/Week/Day/List.
- [ ] User dapat melihat nama kegiatan.
- [ ] User dapat melihat tanggal dan waktu WIB.
- [ ] User dapat melihat lokasi dan link lokasi.
- [ ] User dapat melihat nama PIC.
- [ ] User dapat melihat status event.
- [ ] User dapat melihat priority event.
- [ ] User dapat membuka halaman Prioritas Kegiatan.
- [ ] Public Priority List mengurutkan kegiatan berdasarkan priority dan kedekatan waktu.
- [ ] Public tidak dapat melakukan perubahan data.

### Authentication
- [ ] User dapat login menggunakan mock authentication.
- [ ] Protected route tidak dapat diakses tanpa login.
- [ ] User yang belum login diarahkan ke `/login`.
- [ ] User yang sudah login dapat mengakses management.

### Management
- [ ] Dashboard menampilkan ringkasan COE.
- [ ] User dapat membuka kalender management.
- [ ] User dapat melihat event dalam Month/Week/Day/List.
- [ ] User dapat membuat event.
- [ ] Event dapat memiliki lebih dari satu PIC.
- [ ] User dapat membuat PIC baru.
- [ ] Data PIC menyimpan nama, email, dan nomor telepon.
- [ ] User dapat memperbarui data PIC.
- [ ] User dapat memasukkan lokasi dan link lokasi.
- [ ] Semua waktu ditampilkan dalam WIB.
- [ ] User dapat mengatur H-7, H-3, H-1, Hari H.
- [ ] User dapat menentukan priority High/Medium/Low.
- [ ] Event baru berwarna hijau.
- [ ] Event yang diperbarui berwarna kuning.
- [ ] Event pending berwarna merah.
- [ ] Event completed memiliki status yang jelas.
- [ ] User dapat melihat detail event.
- [ ] User dapat mengedit event.
- [ ] User dapat menghapus event.
- [ ] User dapat mengubah priority.
- [ ] History perubahan tersedia.
- [ ] Creator event dapat diketahui.
- [ ] Updater event dapat diketahui.
- [ ] Notification center tersedia.
- [ ] Email reminder memiliki preview.
- [ ] Mock data terpisah dari UI.
- [ ] Service layer siap untuk Laravel API.
- [ ] Responsive desktop/tablet/mobile.
- [ ] Tidak ada error utama pada browser console.

### Database
- [ ] MySQL database tersedia.
- [ ] schema.sql dapat dijalankan tanpa error.
- [ ] Relasi Event-PIC mendukung multiple PIC.
- [ ] Reminder memiliki relasi dengan Event.
- [ ] Activity Log memiliki relasi yang sesuai.
- [ ] Event memiliki priority.
- [ ] Struktur database siap digunakan Laravel.

---

# 49. Future Backend Architecture

```text
React Frontend
       │
       ▼
Laravel REST API
       │
       ▼
MySQL
       │
       ├── Event
       ├── PIC
       ├── Event PIC
       ├── Reminder
       ├── User
       └── Activity Log
```

Reminder:

```text
Laravel Scheduler
       │
       ▼
Check Reminder
       │
       ▼
Microsoft Graph API
       │
       ▼
Email Perusahaan PIC
```

Backend bertanggung jawab terhadap:
- Authentication
- Authorization
- Database
- CRUD
- Priority management
- Reminder scheduler
- Microsoft Graph API
- Email sending
- Activity log

Frontend hanya menangani:
- UI
- User interaction
- Public read-only display
- Management interface
- Komunikasi API

---

# 50. Important Instructions for Antigravity

1. Fokus hanya pada **Calendar of Event**.
2. Jangan membangun modul APAR.
3. Jangan membangun modul Izin Proyek.
4. Public user dapat melihat Calendar of Event tanpa login.
5. Public user dapat melihat daftar Prioritas Kegiatan tanpa login.
6. Public access harus bersifat read-only.
7. Public dapat melihat nama PIC.
8. Public tidak boleh melihat email dan nomor telepon PIC.
9. Public tidak boleh melihat creator/updater dan activity history internal.
10. Fitur management harus membutuhkan login.
11. Gunakan mock authentication pada frontend phase.
12. Semua tanggal/waktu event menggunakan WIB.
13. Satu event dapat memiliki multiple PIC.
14. PIC memiliki nama, email, dan nomor telepon.
15. PIC dapat dibuat dan diperbarui.
16. Event baru harus memiliki visual hijau.
17. Event yang diperbarui harus memiliki visual kuning.
18. Event pending harus memiliki visual merah.
19. Event completed harus memiliki status yang jelas.
20. Event memiliki priority High, Medium, dan Low.
21. Jangan menganggap priority, status, dan overdue sebagai konsep yang sama.
22. Priority digunakan untuk menentukan daftar Prioritas Kegiatan.
23. Public Priority List mengurutkan High → Medium → Low, kemudian event terdekat.
24. Semua perubahan event harus memiliki histori.
25. Creator dan updater event harus dapat diketahui oleh authenticated user.
26. Reminder menggunakan H-7, H-3, H-1, dan Hari H.
27. Notification channel utama adalah email.
28. Email aktual belum dikirim pada frontend phase.
29. Jangan membuat integrasi WhatsApp pada fase ini.
30. Jangan membuat integrasi Google Calendar pada fase ini.
31. Buat service layer yang siap dihubungkan ke Laravel API.
32. Jangan hard-code data event di dalam page component.
33. Gunakan reusable components.
34. Jangan membuat dependency yang tidak diperlukan.
35. Prioritaskan usability dan responsive design.
36. Gunakan istilah Indonesia pada UI.
37. Gunakan English untuk nama file, component, function, variable, dan code.
38. Jangan melakukan over-engineering.
39. Pastikan perubahan event dapat divisualisasikan dengan jelas.
40. Public UI harus sederhana dan fokus pada informasi COE.
41. Jangan menampilkan tombol management pada public page.
42. Protected route harus memiliki authentication guard.
43. Database menggunakan MySQL.
44. DBeaver digunakan sebagai database management/client tool.
45. Jangan menganggap DBeaver sebagai database engine.
46. Validasi schema.sql sebelum integrasi Laravel.
47. Jangan membuat backend Laravel jika masih berada pada frontend phase.
48. Pastikan struktur frontend mudah dikembangkan menjadi sistem Safety yang lebih besar pada fase berikutnya.
49. Jangan mengubah requirement yang sudah ada tanpa alasan yang jelas.
50. Jika ada konflik requirement, prioritaskan Plan.md dan tanyakan sebelum membuat perubahan besar.

---

# 51. Product Vision

> **Membangun Kalender Event terpusat yang dapat diakses publik untuk melihat agenda dan prioritas kegiatan, sementara akses management dilindungi authentication untuk membantu Departemen Safety mengelola agenda, memastikan PIC menerima reminder tepat waktu melalui email, serta menyediakan histori perubahan yang dapat ditelusuri.**

Fokus utama:

**Public Calendar → Public Priority → Login → Calendar Management → PIC → Reminder → Email → Activity History**
