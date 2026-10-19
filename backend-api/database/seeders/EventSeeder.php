<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Pic;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $picCitra = Pic::create([
            'nama' => 'Citra',
            'email' => 'citra@safety.local',
            'no_telp' => '08123456789',
            'status' => 'Active',
        ]);

        $picAndi = Pic::create([
            'nama' => 'Andi',
            'email' => 'andi@safety.local',
            'no_telp' => '08111222333',
            'status' => 'Active',
        ]);

        $picBudi = Pic::create([
            'nama' => 'Budi',
            'email' => 'budi@safety.local',
            'no_telp' => '08999888777',
            'status' => 'Active',
        ]);

        $picDeni = Pic::create([
            'nama' => 'Deni',
            'email' => 'deni@safety.local',
            'no_telp' => '081333444555',
            'status' => 'Active',
        ]);

        $e1 = Event::create([
            'judul' => 'Safety Patrol',
            'tanggal_mulai' => '2026-09-02',
            'tanggal_selesai' => '2026-09-02',
            'waktu_mulai' => '13:00',
            'waktu_selesai' => '15:00',
            'lokasi' => 'Area Casting',
            'deskripsi' => 'Inspeksi rutin harian di area casting.',
            'status' => 'new',
            'dibuat_oleh' => 'Admin Safety',
        ]);
        $e1->pics()->attach([$picCitra->id]);

        $e2 = Event::create([
            'judul' => 'Safety Meeting',
            'tanggal_mulai' => '2026-09-03',
            'tanggal_selesai' => '2026-09-03',
            'waktu_mulai' => '08:00',
            'waktu_selesai' => '10:00',
            'lokasi' => 'Meeting Room',
            'deskripsi' => 'Meeting bulanan HSE.',
            'status' => 'reschedule',
            'dibuat_oleh' => 'Admin Safety',
        ]);
        $e2->pics()->attach([$picAndi->id, $picBudi->id]);

        $e3 = Event::create([
            'judul' => 'Training K3',
            'tanggal_mulai' => '2026-09-03',
            'tanggal_selesai' => '2026-09-03',
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '12:00',
            'lokasi' => 'Training Center',
            'deskripsi' => 'Training K3 untuk karyawan baru.',
            'status' => 'pending',
            'dibuat_oleh' => 'Admin Safety',
        ]);
        $e3->pics()->attach([$picDeni->id]);

        $e4 = Event::create([
            'judul' => 'Audit Eksternal',
            'tanggal_mulai' => '2026-09-05',
            'tanggal_selesai' => '2026-09-06',
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '16:00',
            'lokasi' => 'All Area',
            'deskripsi' => 'Audit HSE tahunan.',
            'status' => 'completed',
            'dibuat_oleh' => 'Admin Safety',
        ]);
        $e4->pics()->attach([$picCitra->id]);
    }
}
