<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\TestMail;

/*
|--------------------------------------------------------------------------
| Web Routes (Blade Views with Embedded React)
|--------------------------------------------------------------------------
*/

// Public Routes
Route::get('/', function () {
    return view('public.calendar');
})->name('public.calendar');

Route::get('/prioritas', function () {
    return view('public.priority');
})->name('public.priority');

Route::get('/login', function () {
    return view('auth.login');
})->name('login');

Route::get('/register', function () {
    return view('auth.register');
})->name('register');

Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->name('password.request');

// Management Area Routes
Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

Route::get('/kalender', function () {
    return view('calendar');
})->name('calendar');

Route::get('/prioritas/manage', function () {
    return view('priority-manage');
})->name('priority.manage');

Route::get('/pic', function () {
    return view('pic');
})->name('pic');

Route::get('/notifikasi', function () {
    $timezone = config('app.timezone', 'Asia/Jakarta') ?: 'Asia/Jakarta';
    $todayStr = \Carbon\Carbon::today($timezone)->toDateString();
    
    $logs = \App\Models\ReminderLog::with(['event', 'pic'])->orderBy('sent_at', 'desc')->take(50)->get();
    $totalSent = \App\Models\ReminderLog::where('status', 'sent')->count();
    $totalFailed = \App\Models\ReminderLog::where('status', 'failed')->count();
    $todaySent = \App\Models\ReminderLog::where('sent_date', $todayStr)->where('status', 'sent')->count();

    return view('notifikasi', compact('logs', 'totalSent', 'totalFailed', 'todaySent'));
})->name('notifikasi');

Route::get('/pengaturan', function () {
    return view('pengaturan');
})->name('pengaturan');

Route::get('/test-email', function (\Illuminate\Http\Request $request) {
    $recipient = $request->query('to', 'esgsafety2@gmail.com');
    try {
        Mail::to($recipient)->send(new TestMail());
        return response()->json([
            'status' => 'success',
            'message' => "Email reminder berhasil dikirim ke: {$recipient} via Gmail SMTP!",
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::match(['get', 'post'], '/api/cron/send-reminders', [\App\Http\Controllers\Api\ReminderController::class, 'handleCron']);
Route::match(['get', 'post'], '/cron/send-reminders', [\App\Http\Controllers\Api\ReminderController::class, 'handleCron']);
Route::post('/api/reminders/trigger', [\App\Http\Controllers\Api\ReminderController::class, 'trigger']);