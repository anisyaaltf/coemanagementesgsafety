/**
 * Utility to check if the green highlight color (#b7e1cd) is still active
 * for a newly added ('new') or updated ('reschedule' / 'updated') event.
 *
 * Aturan:
 * - Pada Hari H (hari kegiatan diinput/di-update): Berwarna hijau (#b7e1cd).
 * - Pada H + 1 (1 hari setelah diinput / keesokan harinya) dan seterusnya:
 *   Otomatis kembali ke warna putih (#ffffff).
 *
 * Returns true jika kegiatan diinput/diperbarui hari ini (Hari H).
 * Returns false jika sudah melewati Hari H (H + 1 ke atas), sehingga kartu otomatis menjadi putih (#ffffff).
 */
export const isUpdateColorActive = (event) => {
    if (!event) return false;
    const status = getEffectiveStatus(event);
    if (status !== 'new' && status !== 'reschedule' && status !== 'updated') {
        return false;
    }

    // Gunakan waktu terakhir diperbarui (diperbaruiPada / updated_at) atau dibuat (dibuatPada / created_at)
    const rawTimestamp = event.diperbaruiPada || event.updated_at || event.dibuatPada || event.created_at;
    if (!rawTimestamp) return false;

    // Parsing aman terhadap string tanggal/waktu
    let refDate;
    if (typeof rawTimestamp === 'string' && rawTimestamp.length >= 10 && !rawTimestamp.includes('T')) {
        const [y, m, d] = rawTimestamp.substring(0, 10).split('-').map(Number);
        refDate = new Date(y, m - 1, d);
    } else {
        refDate = new Date(rawTimestamp);
    }

    if (isNaN(refDate.getTime())) {
        return false;
    }

    const today = new Date();

    // Bandingkan berdasarkan batas hari kalender lokal (Year, Month, Date)
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const refMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();

    // Selisih hari antara hari ini dan hari input/update:
    // 0 = Diinput/diupdate hari ini (Hari H input) -> Aktif (Hijau)
    // >= 1 = H+1 (1 hari setelah diinput) atau seterusnya -> Tidak aktif (Otomatis Putih)
    const diffDays = Math.round((todayMidnight - refMidnight) / (1000 * 60 * 60 * 24));

    // Hijau (#b7e1cd) hanya aktif pada hari kegiatan diinput (Hari H).
    // Pada H + 1 setelah input kegiatan (diffDays >= 1), otomatis kembali menjadi putih (#ffffff).
    return diffDays <= 0;
};

/**
 * Utility to get the effective status of an event.
 * Hanya kegiatan yang statusnya secara eksplisit 'pending' yang menjadi pending (berwarna merah).
 * Kegiatan yang telah lewat jadwalnya tidak otomatis menjadi pending.
 */
export const getEffectiveStatus = (event) => {
    if (!event) return 'new';
    const status = ((event && event.status) || '').toLowerCase();

    // Jika sudah ditandai 'completed', tetap completed
    if (status === 'completed') {
        return 'completed';
    }

    // Jika berstatus 'pending', tetap pending (berwarna merah)
    if (status === 'pending') {
        return 'pending';
    }

    if (status === 'reschedule' || status === 'updated') {
        return status;
    }

    return status || 'new';
};

/**
 * Menghasilkan array tanggal (YYYY-MM-DD) antara startDate dan endDate (inklusif).
 * Jika tanggal mulai dan selesai sama, mengembalikan 1 tanggal saja.
 */
export const getDatesInRange = (startDateStr, endDateStr) => {
    if (!startDateStr) return [];
    if (!endDateStr || endDateStr === startDateStr) return [startDateStr];

    const dates = [];
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return [startDateStr];
    }

    // Batas aman maksimal 60 hari untuk mencegah loop berlebih
    const maxDays = 60;
    let current = new Date(start);
    let count = 0;

    while (current <= end && count < maxDays) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        current.setDate(current.getDate() + 1);
        count++;
    }

    return dates.length > 0 ? dates : [startDateStr];
};

/**
 * Format rentang tanggal teks bahasa yang rapi (e.g. 28 Sep - 29 Sep 2026)
 */
export const formatEventDateRange = (startDateStr, endDateStr) => {
    if (!startDateStr) return '-';
    if (!endDateStr || endDateStr === startDateStr) {
        return startDateStr;
    }
    return `${startDateStr} s/d ${endDateStr}`;
};