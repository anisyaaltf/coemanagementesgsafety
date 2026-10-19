<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReminderLog extends Model
{
    protected $fillable = [
        'event_id',
        'pic_id',
        'recipient_email',
        'recipient_name',
        'reminder_type',
        'status',
        'error_message',
        'sent_date',
        'sent_at',
    ];

    protected $casts = [
        'sent_date' => 'date',
        'sent_at' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function pic()
    {
        return $this->belongsTo(Pic::class);
    }
}
