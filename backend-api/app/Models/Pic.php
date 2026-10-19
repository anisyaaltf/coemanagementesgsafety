<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pic extends Model
{
    protected $fillable = [
        'nama',
        'email',
        'no_telp',
        'status',
    ];

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_pics');
    }
}

