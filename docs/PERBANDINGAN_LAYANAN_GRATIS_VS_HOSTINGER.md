# Dokumen Analisis & Justifikasi Anggaran: Perbandingan Layanan Gratis vs Hostinger Paket Premium
**Proyek**: Sistem Manajemen Agenda & Reminder ESG & Safety COE  
**Tanggal**: Oktober 2026  
**Penulis**: Tim Pengembang & Operasional ESG COE  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Sistem Informasi **ESG & Safety COE Management** saat ini telah selesai dibangun dan berfungsi secara penuh (*100% Live*). Selama masa pengujian dan rilis awal, sistem berjalan di atas arsitektur **Layanan Gratis (*Free-Tier Multi-Vendor*)** yang terdiri dari Vercel Serverless, Supabase Database, dan Google SMTP dengan total biaya **Rp 0**.

Namun, seiring dengan penggunaan harian oleh personil PIC dan pentingnya keandalan pengingat kegiatan K3/ESG agar **tidak boleh ada jadwal audit atau sertifikasi yang terlewat**, terdapat sejumlah **limitasi kritis** pada layanan gratis yang berisiko mengganggu operasional jangka panjang.

Dokumen ini disusun sebagai **kajian komparatif dan justifikasi Rencana Anggaran Biaya (RAB)** antara mempertahankan kondisi gratis saat ini dengan bermigrasi ke **Hostinger Web Hosting Paket Premium**.

---

## 2. Tabel Komparasi Biaya & Investasi (Financial Comparison)

Berdasarkan Rencana Anggaran Biaya (RAB) yang diajukan:

| Parameter | Kondisi Saat Ini (Gratis) | Opsi A: Hostinger (1 Bulan) | Opsi B: Hostinger (2 Tahun) ⭐ *Direkomendasikan* |
| :--- | :--- | :--- | :--- |
| **Harga Pokok** | Rp 0 | Rp 109.900 / bulan | Rp 1.195.200 / 2 tahun |
| **Pajak PPN (11%)** | Rp 0 | Rp 12.089 | Rp 131.472 |
| **Total Investasi (inc PPN)** | **Rp 0** | **Rp 121.989 / bulan** | **Rp 1.326.672 / 2 tahun** |
| **Beban Efektif per Bulan** | Rp 0 | Rp 121.989 / bulan | **± Rp 55.278 / bulan** |
| **Efisiensi Anggaran** | - | Biaya standar | **Hemat ~55%** dibanding tagihan bulanan |
| **Gratis Domain Kustom** | ❌ Tidak dapat (subdomain) | ❌ Beli domain terpisah | ✅ **Termasuk 1 Domain Gratis (.com/.id) 1 Tahun** |

> 💡 **Catatan Finansial**: Memilih **Opsi B (2 Tahun)** memberikan kepastian anggaran operasional sistem aman selama 24 bulan ke depan hanya dengan biaya operasional setara **± Rp 55.000 per bulan**, serta mendapatkan gratis pendaftaran nama domain resmi.

---

## 3. Matriks Perbandingan Teknis & Operasional

| Indikator Evaluasi | Kondisi Saat Ini (Layanan Gratis) | Hostinger Paket Premium (Berbayar) | Dampak bagi Sistem ESG & Safety |
| :--- | :--- | :--- | :--- |
| **1. Alamat Website & Kredibilitas (*Branding*)** | Menggunakan subdomain pihak ketiga:<br>`coemanagement-kjfs-sigma.vercel.app` | Menggunakan domain resmi perusahaan:<br>`esg-safetycoe.com` / `safety-nusametal.com` | Meningkatkan kepercayaan staf & auditor eksternal saat audit SMK3 / ISO. Tidak terkesan seperti proyek uji coba. |
| **2. Otomatisasi Reminder (*Cron Job*)** | **Terbatas & Kompleks**:<br>• Vercel Hobby dibatasi 1x eksekusi cron per hari.<br>• Untuk reminder jam (H-1 Jam), harus bergantung pada layanan pihak ketiga (*cron-job.org*). | **Native Crontab Linux Bebas**:<br>• Mendukung penjadwalan tak terbatas (per jam, per menit, per hari) langsung dari server.<br>• Sangat stabil tanpa bergantung webhook luar. | **Kritis**: Memastikan reminder harian (07:00 WIB) dan pengingat mendesak sebelum acara (H-1 jam) terkirim 100% tanpa gagal. |
| **3. Batas Waktu Eksekusi (*Execution Timeout*)** | **10 Detik (*Serverless Limit*)**:<br>Jika pengiriman email massal ke banyak PIC memakan waktu >10 detik, proses terpotong paksa (*Function Timeout*). | **60 – 120+ Detik (*Configurable*)**:<br>Mendukung proses eksekusi latar belakang (*background execution*) yang leluasa. | Pengiriman email notifikasi dan reminder ke puluhan PIC sekaligus dijamin selesai sempurna tanpa terputus di tengah jalan. |
| **4. Database & Penyimpanan (*Storage*)** | **Kapasitas Terbatas & Risiko Nonaktif**:<br>• Supabase Free: batas 500 MB data.<br>• **Database otomatis PAUSE/SLEEP** jika tidak ada aktivitas selama 7 hari berturut-turut. | **Kapasitas Sangat Besar & Selalu Aktif**:<br>• Penyimpanan 100 GB SSD.<br>• Database MySQL/PostgreSQL aktif non-stop 24/7 tanpa ada istilah *sleep/pause*. | Menghindari risiko sistem error saat dibuka staf di hari Senin setelah libur panjang (karena database gratis sempat tertidur). |
| **5. Email Resmi Perusahaan** | Menggunakan akun Gmail umum:<br>`esgsafety2@gmail.com` | Email resmi berbasis domain:<br>`reminder@esg-safetycoe.com` atau `admin@safety-nusametal.com` | Email notifikasi tidak mudah masuk folder SPAM di perangkat PIC, dan terlihat jauh lebih profesional. |
| **6. Arsitektur Pemeliharaan (*Maintenance*)** | **Tersebar (*Fragmented*)**:<br>Admin harus mengontrol 4 akun terpisah (Vercel, Supabase, Google Console, Cron-job.org). | **Terpusat (*Single Control Panel*)**:<br>Semua komponen (Website, Database, Domain, Email, Crontab) dikelola dalam satu panel hPanel yang ramah pengguna. | Perawatan sistem jauh lebih mudah, tidak repot jika ada pergantian pengelola sistem di masa depan. |
| **7. Kecepatan Respons Awal (*Cold Start*)** | Sering ada jeda loading 3-5 detik saat pertama kali dibuka karena *container serverless* harus bangun dari kondisi tidur. | Server aktif terus menerus (*Always-on*), waktu respons instan setiap saat dibuka. | Kenyamanan staf saat mengakses dashboard dan membuka form kegiatan meningkat drastis. |
| **8. Garansi Keandalan (*SLA Uptime*)** | Tidak ada jaminan SLA kompensasi jika layanan gratis mengalami gangguan mendadak. | Jaminan **99.9% Uptime Guarantee** dengan tim dukungan teknis *live chat* 24/7. | Menjamin operasional kegiatan K3 dan kepatuhan regulasi berjalan tanpa hambatan teknis. |

---

## 4. Analisis Kelebihan & Kelemahan (SWOT)

```mermaid
quadrantChart
    title Matriks Evaluasi Solusi Infrastruktur
    x-axis Biaya Rendah --> Investasi Berbayar
    y-axis Risiko & Kompleksitas Tinggi --> Stabilitas & Kredibilitas Tinggi
    quadrant-1 Hostinger (Opsi B - 2 Tahun): Paling Stabil & Hemat Jangka Panjang
    quadrant-2 Layanan Gratis: Efisien Awal, Rentan Limitasi Operasional
    quadrant-3 Tidak Direkomendasikan
    quadrant-4 Hostinger (Opsi A - 1 Bulan): Bagus tapi Boros Administrasi
    "Kondisi Saat Ini (Gratis)": [0.15, 0.45]
    "Opsi A (Hostinger 1 Bulan)": [0.65, 0.75]
    "Opsi B (Hostinger 2 Tahun)": [0.55, 0.92]
```

### A. Kondisi Saat Ini (Layanan Gratis)
* **Kelebihan**:
  * Pengeluaran biaya langsung sebesar Rp 0.
  * Sangat cocok untuk fase pengembangan awal (*development*) dan pembuktian konsep (*Proof of Concept*).
* **Kekurangan & Risiko**:
  * Reputasi dan kredibilitas kurang karena URL menggunakan akhiran `.vercel.app`.
  * Sistem *auto-pause* Supabase dapat memutus koneksi database jika libur panjang.
  * Pembatasan kuota cron job dan batas eksekusi 10 detik berisiko menggagalkan pengiriman reminder terjadwal.
  * Email pengirim menggunakan `@gmail.com` yang rentan terfilter sebagai promosi/spam.

### B. Kondisi Berbayar (Hostinger Paket Premium)
* **Kelebihan**:
  * Alamat website resmi perusahaan (meningkatkan citra profesional tim ESG & Safety).
  * Cron job berjalan penuh di level server Linux; reminder otomatis berjalan 100% tepat waktu (baik harian maupun per jam).
  * Database dan server aktif 24 jam sehari, 7 hari seminggu tanpa risiko auto-pause.
  * Kapasitas penyimpanan 100 GB SSD (sangat cukup untuk menampung riwayat kegiatan dan notulensi hingga bertahun-tahun).
  * Pengelolaan terpusat dalam satu akun hPanel.
* **Kekurangan**:
  * Memerlukan alokasi anggaran investasi (Rp 1.326.672 untuk durasi 2 tahun penuh).

---

## 5. Dampak Langsung pada Operasional Sistem Reminder ESG & Safety

Pengingat kegiatan pada divisi **ESG & Safety** memegang peranan krusial karena berhubungan dengan:
1. **Kepatuhan Regulasi K3 & Lingkungan**: Keterlambatan audit sertifikasi (SMK3, ISO 14001, ISO 45001) dapat mengakibatkan temuan audit ketidaksesuaian (*non-conformance*).
2. **Kesiapan Personil (PIC)**: Sistem dirancang untuk mengirim pengingat berjenjang (H-7, H-3, H-1, Hari H, dan H-1 Jam). Pada layanan gratis, pengingat H-1 Jam berisiko tidak terkirim tepat waktu karena batasan *serverless cron*.
3. **Penyimpanan Dokumentasi Notulensi**: Seiring bertambahnya ratusan kegiatan per tahun, penyimpanan terintegrasi di server mandiri menjamin arsip data tersimpan dengan aman tanpa kekhawatiran limit kuota gratis habis.

---

## 6. Kesimpulan & Rekomendasi Keputusan

1. **Kelayakan Teknis**: Sistem aplikasi telah selesai dibangun dan terbukti berhasil bekerja. Untuk melangkah ke tahap implementasi resmi di lingkungan kerja perusahaan, infrastruktur perlu ditingkatkan agar lebih andal, profesional, dan berkesinambungan.
2. **Rekomendasi Pilihan Opsi**:
   * **Sangat Direkomendasikan: Opsi B (Hostinger 2 Tahun - Rp 1.326.672 inc PPN)**.
   * **Alasan**:
     * Menghemat biaya hingga **>50%** dibandingkan opsi langganan bulanan (efektif hanya **Rp 55.278 / bulan**).
     * Sudah termasuk **Gratis 1 Nama Domain Resmi** (menghemat biaya pendaftaran domain ± Rp 150.000–200.000).
     * Menghilangkan beban administrasi perpanjangan bulanan yang merepotkan tim pengadaan/keuangan.
     * Menjamin operasional sistem reminder ESG & Safety berjalan stabil tanpa interupsi selama 2 tahun ke depan.
