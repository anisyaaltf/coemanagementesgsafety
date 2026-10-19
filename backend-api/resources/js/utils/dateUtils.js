/**
 * Utility to check if the green highlight color (#b7e1cd) is still active
 * for a newly added ('new') or updated ('reschedule' / 'updated') event.
 * Returns true if today is within H + 1 (1 day after creation/update date).
 * Returns false if H + 1 has passed (event card returns to its original white color #ffffff).
 */
export const isUpdateColorActive = (event) => {
    const status = getEffectiveStatus(event);
    if (!event || (status !== 'new' && status !== 'reschedule' && status !== 'updated')) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Gunakan waktu terakhir diperbarui (diperbaruiPada) atau dibuat (dibuatPada) sebagai acuan Hari H
    const rawTimestamp = event.diperbaruiPada || event.dibuatPada || event.tanggalMulai;
    if (!rawTimestamp) return false;

    const refDate = new Date(rawTimestamp);
    if (isNaN(refDate.getTime())) {
        return false;
    }
    refDate.setHours(0, 0, 0, 0);

    // H + 1: 1 hari setelah kegiatan ditambahkan/di-update (sampai akhir hari H + 1)
    const hPlusOne = new Date(refDate);
    hPlusOne.setDate(hPlusOne.getDate() + 1);
    hPlusOne.setHours(23, 59, 59, 999);

    return today <= hPlusOne;
};

/**
 * Utility to get the effective status of an event.
 * Jika kegiatan telah melewati jadwalnya (jam/hari) dan belum ditandai 'completed',
 * maka otomatis statusnya menjadi 'pending' (berwarna merah).
 */
export const getEffectiveStatus = (event) => {
    if (!event) return 'new';
    const status = ((event && event.status) || '').toLowerCase();

    // Jika sudah ditandai 'completed', tetap completed
    if (status === 'completed') {
        return 'completed';
    }

    const dateStr = event.tanggalSelesai || event.tanggalMulai;
    if (!dateStr) return status || 'new';

    const timeStr = event.waktuSelesai || event.waktuMulai || '23:59';
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    const dateParts = dateStr.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);

    if (!year || !month || !day) return status || 'new';

    const eventEndTime = new Date(year, month - 1, day, hours, minutes, 59);
    const now = new Date();

    // Jika waktu/hari sekarang sudah melewati batas jam & tanggal kegiatan, otomatis 'pending'
    if (now > eventEndTime) {
        return 'pending';
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