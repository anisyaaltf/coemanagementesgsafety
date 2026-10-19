<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    // Mengizinkan mass assignment untuk kolom-kolom ini
    protected $fillable = [
        'judul',
        'penyelenggara',
        'tanggal_mulai',
        'tanggal_selesai',
        'waktu_mulai',
        'waktu_selesai',
        'lokasi',
        'deskripsi',
        'notulensi',
        'notulensi_link',
        'status',
        'priority',
        'reminders',
        'dibuat_oleh',
        'diperbarui_oleh',
    ];

    protected $casts = [
        'reminders' => 'array',
    ];

    // Relasi Many-to-Many ke model Pic (melalui tabel pivot event_pics)
    public function pics()
    {
        return $this->belongsToMany(Pic::class, 'event_pics');
    }

    // Relasi ke ReminderLog
    public function reminderLogs()
    {
        return $this->hasMany(ReminderLog::class);
    }

    /**
     * Accessor: jika reminders null di DB, berikan default semua aktif
     */
    public function getRemindersAttribute($value)
    {
        if (is_null($value)) {
            return ['H-7', 'H-3', 'H-1', 'Hari H'];
        }

        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return is_array($decoded) ? $decoded : ['H-7', 'H-3', 'H-1', 'Hari H'];
    }

    /**
     * Cek apakah jenis reminder tertentu aktif untuk event ini.
     * Mendukung format array string ['H-7', 'Hari H'] atau array object [['type' => 'H-7', 'enabled' => true], ...]
     */
    public function isReminderEnabled(string $type): bool
    {
        $reminders = $this->reminders;
        if (empty($reminders)) {
            return false;
        }

        foreach ($reminders as $item) {
            if (is_string($item)) {
                if (strcasecmp(trim($item), trim($type)) === 0) {
                    return true;
                }
            } elseif (is_array($item)) {
                $itemType = $item['type'] ?? '';
                $itemEnabled = $item['enabled'] ?? false;
                if (strcasecmp(trim($itemType), trim($type)) === 0) {
                    return filter_var($itemEnabled, FILTER_VALIDATE_BOOLEAN);
                }
            }
        }

        return false;
    }
}

