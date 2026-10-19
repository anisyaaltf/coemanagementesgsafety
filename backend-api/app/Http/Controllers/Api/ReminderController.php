<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReminderLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class ReminderController extends Controller
{
    /**
     * Endpoint untuk Cron Job Otomatis (Vercel Cron, cron-job.org, Windows Task Scheduler / curl)
     */
    public function handleCron(Request $request)
    {
        $cronSecret = env('CRON_SECRET');
        if (!empty($cronSecret)) {
            $key = $request->header('X-Cron-Key') ?: $request->query('key');
            if ($key !== $cronSecret) {
                return response()->json(['message' => 'Unauthorized cron request'], 401);
            }
        }

        $params = [];
        if ($request->has('type')) {
            $params['--type'] = $request->query('type');
        }
        if ($request->boolean('force')) {
            $params['--force'] = true;
        }
        if ($request->has('event')) {
            $params['--event'] = $request->query('event');
        }
        if ($request->has('to')) {
            $params['--to'] = $request->query('to');
        }
        if ($request->boolean('dry_run') || $request->boolean('dry-run')) {
            $params['--dry-run'] = true;
        }

        try {
            Artisan::call('events:send-reminders', $params);
            $output = Artisan::output();

            return response()->json([
                'status' => 'success',
                'message' => 'Proses reminder berhasil dieksekusi',
                'output' => $output,
                'executed_at' => now()->setTimezone(config('app.timezone', 'Asia/Jakarta'))->toDateTimeString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Cron reminder error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menjalankan cron reminder: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mengambil riwayat / log pengiriman reminder
     */
    public function logs(Request $request)
    {
        $query = ReminderLog::with(['event', 'pic'])->orderBy('sent_at', 'desc');

        if ($request->has('event_id')) {
            $query->where('event_id', $request->query('event_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $limit = min((int) $request->query('limit', 50), 100);
        $logs = $query->paginate($limit);

        return response()->json($logs);
    }

    /**
     * Trigger manual dari UI Admin
     */
    public function trigger(Request $request)
    {
        $params = [];
        if ($request->has('type')) {
            $params['--type'] = $request->input('type');
        }
        if ($request->boolean('force')) {
            $params['--force'] = true;
        }
        if ($request->has('event_id')) {
            $params['--event'] = $request->input('event_id');
        }
        if ($request->has('to')) {
            $params['--to'] = $request->input('to');
        }

        try {
            Artisan::call('events:send-reminders', $params);
            $output = Artisan::output();

            return response()->json([
                'status' => 'success',
                'message' => 'Reminder berhasil diproses',
                'output' => $output,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses reminder: ' . $e->getMessage(),
            ], 500);
        }
    }
}
