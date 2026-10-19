<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $picName;
    public $eventName;
    public $eventDateTime;
    public $location;

    public function __construct(
        $picName = 'Oka Bizantrio',
        $eventName = 'Review TTF',
        $eventDateTime = 'Kamis, 02 Oktober 2026, 14:00 - 15:00 WIB',
        $location = 'Ruang Rapat Utama'
    ) {
        $this->picName = $picName;
        $this->eventName = $eventName;
        $this->eventDateTime = $eventDateTime;
        $this->location = $location;
    }

    public function build()
    {
        $fromAddress = config('mail.from.address', env('MAIL_FROM_ADDRESS', 'onboarding@resend.dev'));
        $fromName = config('mail.from.name', env('MAIL_FROM_NAME', 'ESG Safety'));

        return $this
            ->from($fromAddress, $fromName)
            ->subject('Pengingat Jadwal Kegiatan: ' . $this->eventName . ' - ESG & Safety')
            ->view('emails.reminder')
            ->text('emails.reminder_plain')
            ->with([
                'picName' => $this->picName,
                'eventName' => $this->eventName,
                'eventDateTime' => $this->eventDateTime,
                'location' => $this->location,
            ]);
    }
}