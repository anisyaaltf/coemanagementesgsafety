<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\Pic;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $picName;
    public $eventName;
    public $eventDateTime;
    public $location;
    public $event;
    public $reminderTag;
    public $reminderNote;

    /**
     * Create a new message instance.
     *
     * @param string|Event $picOrEvent
     * @param string|Pic|null $eventNameOrPic
     * @param string|null $eventDateTime
     * @param string|null $location
     * @param string $reminderTag ('H-7', 'H-3', 'H-1', 'Hari H', 'H-1 Jam')
     */
    public function __construct(
        $picOrEvent = 'Rekan Tim',
        $eventNameOrPic = 'Kegiatan ESG & Safety',
        $eventDateTime = null,
        $location = null,
        $reminderTag = 'Hari H'
    ) {
        $this->reminderTag = $reminderTag ?: 'Hari H';

        if ($picOrEvent instanceof Event) {
            $this->event = $picOrEvent;
            $this->eventName = $picOrEvent->judul ?? 'Kegiatan ESG & Safety';
            
            // Tentukan PIC
            if ($eventNameOrPic instanceof Pic) {
                $this->picName = $eventNameOrPic->nama;
            } elseif (is_string($eventNameOrPic) && !empty($eventNameOrPic)) {
                $this->picName = $eventNameOrPic;
            } else {
                $firstPic = $picOrEvent->pics->first();
                $this->picName = $firstPic ? $firstPic->nama : 'Rekan Tim';
            }

            // Format tanggal & waktu
            $start = $picOrEvent->tanggal_mulai;
            $end = $picOrEvent->tanggal_selesai;
            $dateStr = ($start === $end || empty($end))
                ? date('d F Y', strtotime($start))
                : date('d F Y', strtotime($start)) . ' s/d ' . date('d F Y', strtotime($end));

            $timeStr = '';
            if ($picOrEvent->waktu_mulai) {
                $timeStr = substr($picOrEvent->waktu_mulai, 0, 5);
                if ($picOrEvent->waktu_selesai) {
                    $timeStr .= ' - ' . substr($picOrEvent->waktu_selesai, 0, 5);
                }
                $timeStr .= ' WIB';
            }

            $this->eventDateTime = trim($dateStr . ($timeStr ? ', ' . $timeStr : ''));
            $this->location = $picOrEvent->lokasi;
        } else {
            $this->picName = $picOrEvent;
            $this->eventName = $eventNameOrPic;
            $this->eventDateTime = $eventDateTime ?? date('d F Y, H:i') . ' WIB';
            $this->location = $location;
        }

        // Tentukan note dan pesan berdasarkan reminderTag
        switch ($this->reminderTag) {
            case 'Kegiatan Baru':
            case 'New Event Added':
                $this->reminderNote = 'Anda telah ditugaskan sebagai Person in Charge (PIC) untuk agenda kegiatan baru berikut:';
                break;
            case 'H-1 Jam':
                $this->reminderNote = 'PERHATIAN: Kegiatan ini akan dimulai dalam waktu 1 jam ke depan. Mohon untuk segera bersiap di lokasi kegiatan.';
                break;
            case 'Hari H':
                $this->reminderNote = 'Hari ini Anda memiliki agenda kegiatan berikut yang perlu dihadiri/dikoordinasikan:';
                break;
            case 'H-1':
                $this->reminderNote = 'Besok Anda memiliki jadwal kegiatan berikut. Mohon persiapkan perlengkapan dan koordinasi yang diperlukan:';
                break;
            case 'H-3':
                $this->reminderNote = 'Pengingat H-3: Dalam 3 hari ke depan Anda memiliki agenda kegiatan berikut:';
                break;
            case 'H-7':
                $this->reminderNote = 'Pengingat H-7: Dalam 1 minggu ke depan Anda memiliki agenda kegiatan berikut:';
                break;
            default:
                $this->reminderNote = 'Anda memiliki agenda kegiatan berikut:';
                break;
        }
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $fromAddress = config('mail.from.address', env('MAIL_FROM_ADDRESS', 'esgsafety2@gmail.com'));
        $fromName = config('mail.from.name', env('MAIL_FROM_NAME', 'ESG & SAFETY'));

        // Subject dinamis berdasarkan reminderTag
        $subjectPrefix = match ($this->reminderTag) {
            'Kegiatan Baru', 'New Event Added' => '[AGENDA BARU]',
            'H-1 Jam' => '[PENTING - 1 Jam Lagi]',
            'Hari H' => '[HARI INI]',
            'H-1' => '[H-1 BESOK]',
            'H-3' => '[H-3]',
            'H-7' => '[H-7]',
            default => '[REMINDER]'
        };

        $subject = "{$subjectPrefix} Jadwal Kegiatan: {$this->eventName} - ESG & Safety";

        return $this
            ->from($fromAddress, $fromName)
            ->subject($subject)
            ->view('emails.reminder')
            ->text('emails.reminder_plain');
    }
}
