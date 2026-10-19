<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::with('pics')->orderBy('created_at', 'desc')->get();
        return response()->json($events);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->has('priority') && $request->input('priority') !== null) {
            $request->merge([
                'priority' => strtolower(trim((string)$request->input('priority')))
            ]);
        }

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'penyelenggara' => 'nullable|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date',
            'waktu_mulai' => 'nullable',
            'waktu_selesai' => 'nullable',
            'lokasi' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'notulensi' => 'nullable|string',
            'notulensi_link' => 'nullable|string|max:500',
            'status' => 'nullable|string',
            'priority' => 'nullable|string|in:priority,standard',
            'reminders' => 'nullable|array',
            'dibuat_oleh' => 'nullable|string',
            'pic_ids' => 'nullable|array',
            'pics' => 'nullable|array',
            'pic_nama' => 'nullable|string',
            'pic_email' => 'nullable|string',
            'pic_no_telp' => 'nullable|string',
        ]);

        if (empty($validated['priority'])) {
            $validated['priority'] = 'standard';
        }

        $eventData = array_diff_key($validated, array_flip(['pic_ids', 'pics', 'pic_nama', 'pic_email', 'pic_no_telp']));

        // Convert empty string time/date/text fields to null for PostgreSQL compatibility
        $nullableFields = ['waktu_mulai', 'waktu_selesai', 'lokasi', 'penyelenggara', 'deskripsi', 'notulensi', 'notulensi_link', 'dibuat_oleh', 'diperbarui_oleh'];
        foreach ($nullableFields as $field) {
            if (array_key_exists($field, $eventData) && ($eventData[$field] === '' || $eventData[$field] === null)) {
                $eventData[$field] = null;
            }
        }

        $event = Event::create($eventData);

        $picIdsToSync = $request->input('pic_ids', []);

        // Process multiple pics array if present
        if ($request->has('pics') && is_array($request->input('pics'))) {
            foreach ($request->input('pics') as $picItem) {
                $pName = $picItem['nama'] ?? $picItem['name'] ?? null;
                $pEmail = !empty($picItem['email']) ? trim($picItem['email']) : null;
                $pPhone = $picItem['noTelp'] ?? $picItem['no_telp'] ?? $picItem['phone'] ?? '';

                if (!empty($picItem['id']) && is_numeric($picItem['id'])) {
                    $pid = (int)$picItem['id'];
                    $existingPic = \App\Models\Pic::find($pid);
                    if ($existingPic) {
                        if ($pEmail && empty($existingPic->email)) {
                            $existingPic->email = $pEmail;
                            $existingPic->save();
                        }
                        if (!in_array($pid, $picIdsToSync)) {
                            $picIdsToSync[] = $pid;
                        }
                    }
                } else if (!empty($pEmail) && !empty($pName)) {
                    $pic = \App\Models\Pic::firstOrCreate(
                        ['email' => $pEmail],
                        [
                            'nama' => $pName,
                            'no_telp' => $pPhone,
                            'status' => 'Active'
                        ]
                    );
                    if (!in_array($pic->id, $picIdsToSync)) {
                        $picIdsToSync[] = $pic->id;
                    }
                }
            }
        }

        if (!empty($request->pic_email) && !empty($request->pic_nama)) {
            $pic = \App\Models\Pic::firstOrCreate(
                ['email' => $request->pic_email],
                [
                    'nama' => $request->pic_nama,
                    'no_telp' => $request->pic_no_telp ?? '',
                    'status' => 'Active'
                ]
            );
            if (!in_array($pic->id, $picIdsToSync)) {
                $picIdsToSync[] = $pic->id;
            }
        }

        if (!empty($picIdsToSync)) {
            $event->pics()->sync($picIdsToSync);
        }

        $eventWithPics = $event->load('pics');

        // Otomatis kirim notifikasi email ke semua PIC saat kegiatan baru ditambahkan
        try {
            foreach ($eventWithPics->pics as $pic) {
                if (!empty($pic->email)) {
                    \Illuminate\Support\Facades\Mail::to($pic->email)->send(
                        new \App\Mail\EventReminderMail($eventWithPics, $pic, null, null, 'Kegiatan Baru')
                    );

                    if (class_exists(\App\Models\ReminderLog::class)) {
                        \App\Models\ReminderLog::create([
                            'event_id' => $event->id,
                            'pic_id' => $pic->id,
                            'recipient_email' => $pic->email,
                            'reminder_type' => 'Kegiatan Baru',
                            'sent_date' => now()->toDateString(),
                            'status' => 'sent',
                            'response_message' => 'Notifikasi agenda kegiatan baru otomatis terkirim',
                            'sent_at' => now(),
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Auto-email new event failed: ' . $e->getMessage());
        }

        return response()->json($eventWithPics, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $event = Event::with('pics')->findOrFail($id);
        return response()->json($event);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $event = Event::findOrFail($id);

        if ($request->has('priority') && $request->input('priority') !== null) {
            $request->merge([
                'priority' => strtolower(trim((string)$request->input('priority')))
            ]);
        }

        $validated = $request->validate([
            'judul' => 'sometimes|required|string|max:255',
            'penyelenggara' => 'nullable|string|max:255',
            'tanggal_mulai' => 'sometimes|required|date',
            'tanggal_selesai' => 'sometimes|required|date',
            'waktu_mulai' => 'nullable',
            'waktu_selesai' => 'nullable',
            'lokasi' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'notulensi' => 'nullable|string',
            'notulensi_link' => 'nullable|string|max:500',
            'status' => 'nullable|string',
            'priority' => 'nullable|string|in:priority,standard',
            'reminders' => 'nullable|array',
            'diperbarui_oleh' => 'nullable|string',
            'pic_ids' => 'nullable|array',
            'pics' => 'nullable|array',
            'pic_nama' => 'nullable|string',
            'pic_email' => 'nullable|string',
            'pic_no_telp' => 'nullable|string',
        ]);

        $eventData = array_diff_key($validated, array_flip(['pic_ids', 'pics', 'pic_nama', 'pic_email', 'pic_no_telp']));

        // Convert empty string time/date/text fields to null for PostgreSQL compatibility
        $nullableFields = ['waktu_mulai', 'waktu_selesai', 'lokasi', 'penyelenggara', 'deskripsi', 'notulensi', 'notulensi_link', 'diperbarui_oleh'];
        foreach ($nullableFields as $field) {
            if (array_key_exists($field, $eventData) && ($eventData[$field] === '' || $eventData[$field] === null)) {
                $eventData[$field] = null;
            }
        }

        $event->update($eventData);
        $event->touch();

        $picIdsToSync = $request->input('pic_ids', []);

        // Process multiple pics array if present
        if ($request->has('pics') && is_array($request->input('pics'))) {
            foreach ($request->input('pics') as $picItem) {
                $pName = $picItem['nama'] ?? $picItem['name'] ?? null;
                $pEmail = !empty($picItem['email']) ? trim($picItem['email']) : null;
                $pPhone = $picItem['noTelp'] ?? $picItem['no_telp'] ?? $picItem['phone'] ?? '';

                if (!empty($picItem['id']) && is_numeric($picItem['id'])) {
                    $pid = (int)$picItem['id'];
                    $existingPic = \App\Models\Pic::find($pid);
                    if ($existingPic) {
                        if ($pEmail && empty($existingPic->email)) {
                            $existingPic->email = $pEmail;
                            $existingPic->save();
                        }
                        if (!in_array($pid, $picIdsToSync)) {
                            $picIdsToSync[] = $pid;
                        }
                    }
                } else if (!empty($pEmail) && !empty($pName)) {
                    $pic = \App\Models\Pic::firstOrCreate(
                        ['email' => $pEmail],
                        [
                            'nama' => $pName,
                            'no_telp' => $pPhone,
                            'status' => 'Active'
                        ]
                    );
                    if (!in_array($pic->id, $picIdsToSync)) {
                        $picIdsToSync[] = $pic->id;
                    }
                }
            }
        }

        if (!empty($request->pic_email) && !empty($request->pic_nama)) {
            $pic = \App\Models\Pic::firstOrCreate(
                ['email' => $request->pic_email],
                [
                    'nama' => $request->pic_nama,
                    'no_telp' => $request->pic_no_telp ?? '',
                    'status' => 'Active'
                ]
            );
            if (!in_array($pic->id, $picIdsToSync)) {
                $picIdsToSync[] = $pic->id;
            }
        }

        if ($request->has('pic_ids') || $request->has('pics') || (!empty($request->pic_email) && !empty($request->pic_nama))) {
            $event->pics()->sync($picIdsToSync);
        }

        return response()->json($event->load('pics'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}

