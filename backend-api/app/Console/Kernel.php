<?php

namespace App\Console;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule($schedule)
    {
        $tz = config('app.timezone', 'Asia/Jakarta') ?: 'Asia/Jakarta';

        // 1. Kirim reminder harian tepat di jam 07:00 pagi WIB (H-7, H-3, H-1, dan Hari H Pagi)
        $schedule->command('events:send-reminders --type=daily')
            ->dailyAt('07:00')
            ->timezone($tz)
            ->withoutOverlapping()
            ->runInBackground();

        // 2. Cek dan kirim reminder H-1 Jam pada Hari H setiap 10 menit
        $schedule->command('events:send-reminders --type=hourly')
            ->everyTenMinutes()
            ->timezone($tz)
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}