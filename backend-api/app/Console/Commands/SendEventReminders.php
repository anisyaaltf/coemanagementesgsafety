<?php

namespace App\Console\Commands;

use App\Mail\EventReminderMail;
use App\Models\Event;
use App\Models\ReminderLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEventReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'events:send-reminders 
                            {--event= : Filter berdasarkan ID kegiatan tertentu} 
                            {--to= : Override email penerima kegiatan untuk testing}
                            {--type= : Tipe reminder yang diproses: daily, hourly, H-7, H-3, H-1, Hari H, H-1 Jam, all}
                            {--force : Paksa kirim meskipun sudah pernah tercatat terkirim}
                            {--dry-run : Simulasi pengecekan tanpa mengirim email sebenarnya}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim otomatis email reminder jadwal kegiatan kepada PIC sesuai jadwal (Jam 07:00 Pagi & H-1 Jam)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $timezone = config('app.timezone', 'Asia/Jakarta') ?: 'Asia/Jakarta';
        $now = Carbon::now($timezone);
        $todayStr = $now->toDateString();
        $currentHour = (int) $now->format('H');

        $specificEventId = $this->option('event');
        $overrideRecipient = $this->option('to');
        $typeOption = strtolower((string) $this->option('type'));
        $force = (bool) $this->option('force');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("=== PROSES REMINDER EMAIL KEGIATAN ESG & SAFETY ===");
        $this->info("Waktu Server (WIB): " . $now->format('Y-m-d H:i:s'));
        if ($dryRun) {
            $this->warn("[DRY-RUN MODE AKTIF: Tidak ada email yang benar-benar dikirim]");
        }
        if ($force) {
            $this->warn("[FORCE MODE AKTIF: Mengabaikan riwayat pengiriman sebelumnya]");
        }

        // Tentukan apakah daily (jam 07:00 pagi) dan/atau hourly (H-1 jam) yang harus diproses
        $processDaily = false;
        $processHourly = false;

        if ($typeOption === 'daily') {
            $processDaily = true;
        } elseif ($typeOption === 'hourly' || $typeOption === 'h-1-jam' || $typeOption === 'h-1 jam') {
            $processHourly = true;
        } elseif (in_array($typeOption, ['h-7', 'h-3', 'h-1', 'hari h', 'all'])) {
            $processDaily = true;
            if ($typeOption === 'all' || $typeOption === 'hari h') {
                $processHourly = true;
            }
        } else {
            // Mode default otomatis:
            // 1. Jika jam 7 pagi (07:00 - 07:59), jalankan daily dan hourly
            // 2. Jika force atau ada specific event, jalankan keduanya
            // 3. Selain itu jalankan hourly (cek H-1 jam kegiatan hari ini)
            if ($currentHour === 7 || $force || $specificEventId) {
                $processDaily = true;
            }
            $processHourly = true;
        }

        $this->line("Mode: " . ($processDaily ? '[Daily Jam 07:00] ' : '') . ($processHourly ? '[Hourly H-1 Jam]' : ''));

        // Ambil event yang aktif (bukan completed / cancelled)
        $query = Event::with('pics')
            ->whereIn('status', ['new', 'reschedule', 'updated']);

        if ($specificEventId) {
            $query->where('id', $specificEventId);
        } else {
            // Ambil event yang sedang berjalan hari ini (single-day maupun multi-day),
            // ATAU event yang akan mulai dalam rentang 1 s/d 8 hari ke depan (untuk reminder H-1, H-3, H-7)
            $maxFutureDate = $now->copy()->addDays(8)->toDateString();
            $query->where(function ($q) use ($todayStr, $maxFutureDate) {
                $q->where(function ($sub) use ($todayStr) {
                    $sub->where('tanggal_mulai', '<=', $todayStr)
                        ->where('tanggal_selesai', '>=', $todayStr);
                })->orWhere(function ($sub) use ($todayStr, $maxFutureDate) {
                    $sub->where('tanggal_mulai', '>=', $todayStr)
                        ->where('tanggal_mulai', '<=', $maxFutureDate);
                });
            });
        }

        $events = $query->orderBy('tanggal_mulai', 'asc')->get();

        if ($events->isEmpty()) {
            $this->info("Tidak ada kegiatan aktif yang memerlukan reminder saat ini.");
            return 0;
        }

        $totalSent = 0;
        $totalSkipped = 0;
        $totalFailed = 0;

        foreach ($events as $event) {
            $startDate = Carbon::parse($event->tanggal_mulai, $timezone)->startOfDay();
            $endDate = Carbon::parse($event->tanggal_selesai ?: $event->tanggal_mulai, $timezone)->startOfDay();
            $todayStart = $now->copy()->startOfDay();

            // Cek apakah hari ini merupakan hari pelaksanaan kegiatan (Hari H)
            $isHariH = ($todayStr >= $event->tanggal_mulai && $todayStr <= ($event->tanggal_selesai ?: $event->tanggal_mulai));

            // Selisih hari menuju tanggal mulai kegiatan
            $diffDaysToStart = (int) $todayStart->diffInDays($startDate, false);

            $pics = $event->pics;
            if ($pics->isEmpty()) {
                $this->warn("Kegiatan #{$event->id} '{$event->judul}' tidak memiliki PIC terdaftar. Dilewati.");
                continue;
            }

            // 1. PROSES REMINDER HARIAN (Jam 07:00 Pagi): H-7, H-3, H-1, Hari H
            if ($processDaily) {
                $dailyTypeToTrigger = null;

                if ($isHariH && $event->isReminderEnabled('Hari H')) {
                    $dailyTypeToTrigger = 'Hari H';
                } elseif ($diffDaysToStart === 1 && $event->isReminderEnabled('H-1')) {
                    $dailyTypeToTrigger = 'H-1';
                } elseif ($diffDaysToStart === 3 && $event->isReminderEnabled('H-3')) {
                    $dailyTypeToTrigger = 'H-3';
                } elseif ($diffDaysToStart === 7 && $event->isReminderEnabled('H-7')) {
                    $dailyTypeToTrigger = 'H-7';
                }

                // Filter jika ada opsi specific type seperti --type=H-7
                if ($dailyTypeToTrigger && in_array($typeOption, ['h-7', 'h-3', 'h-1', 'hari h'])) {
                    if (strcasecmp($typeOption, $dailyTypeToTrigger) !== 0) {
                        $dailyTypeToTrigger = null;
                    }
                }

                if ($dailyTypeToTrigger) {
                    foreach ($pics as $pic) {
                        $recipientEmail = $overrideRecipient ?: $pic->email;
                        if (empty($recipientEmail)) {
                            continue;
                        }

                        // Cek apakah sudah pernah dikirim hari ini
                        $alreadySent = false;
                        if (!$force) {
                            $alreadySent = ReminderLog::where('event_id', $event->id)
                                ->where('recipient_email', $recipientEmail)
                                ->where('reminder_type', $dailyTypeToTrigger)
                                ->where('sent_date', $todayStr)
                                ->where('status', 'sent')
                                ->exists();
                        }

                        if ($alreadySent) {
                            $this->line(" - [Sudah Terkirim Hari Ini] {$dailyTypeToTrigger} ke {$pic->nama} ({$recipientEmail}) untuk '{$event->judul}'");
                            $totalSkipped++;
                            continue;
                        }

                        $this->info(" > Mengirim [{$dailyTypeToTrigger}] ke: {$pic->nama} ({$recipientEmail}) - '{$event->judul}'");

                        if ($dryRun) {
                            $totalSent++;
                            continue;
                        }

                        try {
                            Mail::to($recipientEmail)->send(new EventReminderMail($event, $pic, null, null, $dailyTypeToTrigger));

                            ReminderLog::create([
                                'event_id' => $event->id,
                                'pic_id' => $pic->id,
                                'recipient_email' => $recipientEmail,
                                'recipient_name' => $pic->nama,
                                'reminder_type' => $dailyTypeToTrigger,
                                'status' => 'sent',
                                'error_message' => null,
                                'sent_date' => $todayStr,
                                'sent_at' => Carbon::now($timezone),
                            ]);

                            $this->info("   ✓ Berhasil dikirim!");
                            $totalSent++;
                        } catch (\Exception $e) {
                            $this->error("   ✗ Gagal kirim: " . $e->getMessage());
                            Log::error("Reminder {$dailyTypeToTrigger} gagal untuk event #{$event->id} ke {$recipientEmail}: " . $e->getMessage());

                            ReminderLog::create([
                                'event_id' => $event->id,
                                'pic_id' => $pic->id,
                                'recipient_email' => $recipientEmail,
                                'recipient_name' => $pic->nama,
                                'reminder_type' => $dailyTypeToTrigger,
                                'status' => 'failed',
                                'error_message' => $e->getMessage(),
                                'sent_date' => $todayStr,
                                'sent_at' => Carbon::now($timezone),
                            ]);

                            $totalFailed++;
                        }
                    }
                }
            }

            // 2. PROSES REMINDER H-1 JAM (Pada Hari H, 1 jam sebelum waktu mulai)
            if ($processHourly && $isHariH && $event->isReminderEnabled('Hari H')) {
                if (!empty($event->waktu_mulai)) {
                    // Buat datetime lengkap waktu mulai kegiatan untuk hari ini
                    $eventStartTime = Carbon::parse($todayStr . ' ' . $event->waktu_mulai, $timezone);
                    
                    // Selisih menit antara sekarang dan waktu mulai kegiatan
                    $diffInMinutes = $now->diffInMinutes($eventStartTime, false);

                    // Kondisi H-1 Jam:
                    // Acara belum dimulai ($diffInMinutes > 0) dan waktu tersisa <= 65 menit
                    // (Toleransi 65 menit untuk mengcover runner scheduler per jam / per 10 menit)
                    $isHMinus1HourWindow = ($diffInMinutes > 0 && $diffInMinutes <= 65);

                    if ($isHMinus1HourWindow || $force) {
                        foreach ($pics as $pic) {
                            $recipientEmail = $overrideRecipient ?: $pic->email;
                            if (empty($recipientEmail)) {
                                continue;
                            }

                            // Cek apakah reminder H-1 Jam sudah pernah dikirim untuk event ini
                            $alreadySentH1Jam = false;
                            if (!$force) {
                                $alreadySentH1Jam = ReminderLog::where('event_id', $event->id)
                                    ->where('recipient_email', $recipientEmail)
                                    ->where('reminder_type', 'H-1 Jam')
                                    ->where('status', 'sent')
                                    ->exists();
                            }

                            if ($alreadySentH1Jam) {
                                $this->line(" - [Sudah Terkirim] H-1 Jam ke {$pic->nama} ({$recipientEmail}) untuk '{$event->judul}'");
                                $totalSkipped++;
                                continue;
                            }

                            $this->info(" > Mengirim [H-1 Jam] ({$diffInMinutes} menit lagi) ke: {$pic->nama} ({$recipientEmail}) - '{$event->judul}'");

                            if ($dryRun) {
                                $totalSent++;
                                continue;
                            }

                            try {
                                Mail::to($recipientEmail)->send(new EventReminderMail($event, $pic, null, null, 'H-1 Jam'));

                                ReminderLog::create([
                                    'event_id' => $event->id,
                                    'pic_id' => $pic->id,
                                    'recipient_email' => $recipientEmail,
                                    'recipient_name' => $pic->nama,
                                    'reminder_type' => 'H-1 Jam',
                                    'status' => 'sent',
                                    'error_message' => null,
                                    'sent_date' => $todayStr,
                                    'sent_at' => Carbon::now($timezone),
                                ]);

                                $this->info("   ✓ Berhasil dikirim [H-1 Jam]!");
                                $totalSent++;
                            } catch (\Exception $e) {
                                $this->error("   ✗ Gagal kirim H-1 Jam: " . $e->getMessage());
                                Log::error("Reminder H-1 Jam gagal untuk event #{$event->id} ke {$recipientEmail}: " . $e->getMessage());

                                ReminderLog::create([
                                    'event_id' => $event->id,
                                    'pic_id' => $pic->id,
                                    'recipient_email' => $recipientEmail,
                                    'recipient_name' => $pic->nama,
                                    'reminder_type' => 'H-1 Jam',
                                    'status' => 'failed',
                                    'error_message' => $e->getMessage(),
                                    'sent_date' => $todayStr,
                                    'sent_at' => Carbon::now($timezone),
                                ]);

                                $totalFailed++;
                            }
                        }
                    }
                }
            }
        }

        $this->info("=== SELESAI ===");
        $this->info("Terkirim: {$totalSent} | Dilewati (sudah terkirim): {$totalSkipped} | Gagal: {$totalFailed}");

        return 0;
    }
}
