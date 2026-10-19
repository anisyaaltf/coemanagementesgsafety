<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register User Baru
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'nrp' => 'required|string|max:50|unique:users,nrp',
            'no_wa' => 'required|string|max:20',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'nrp.required' => 'NRP wajib diisi.',
            'nrp.unique' => 'NRP sudah terdaftar.',
            'no_wa.required' => 'Nomor WhatsApp wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal 6 karakter.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'nrp' => $validated['nrp'],
            'no_wa' => $validated['no_wa'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
        ]);

        return response()->json([
            'message' => 'Registrasi akun berhasil. Silakan login.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nrp' => $user->nrp,
                'no_wa' => $user->no_wa,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201);
    }

    /**
     * Login User (Bisa Menggunakan Email atau NRP)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email atau NRP wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $identifier = $request->email;

        // Cari berdasarkan Email atau NRP
        $user = User::where('email', $identifier)
            ->orWhere('nrp', $identifier)
            ->first();

        // Autocreate default demo admin if not exists in DB yet
        if (!$user && ($identifier === 'admin@safety.local' || $identifier === '12345678') && $request->password === 'password') {
            $user = User::create([
                'name' => 'Admin Safety',
                'nrp' => '12345678',
                'no_wa' => '081234567890',
                'email' => 'admin@safety.local',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]);
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email/NRP atau password salah.'
            ], 401);
        }

        return response()->json([
            'message' => 'Login berhasil',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nrp' => $user->nrp,
                'no_wa' => $user->no_wa,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 200);
    }

    /**
     * Lupa Password - Verifikasi User
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
        ], [
            'email.required' => 'Email atau NRP wajib diisi.',
        ]);

        $identifier = $request->email;

        $user = User::where('email', $identifier)
            ->orWhere('nrp', $identifier)
            ->first();

        if (!$user && ($identifier === 'admin@safety.local' || $identifier === '12345678')) {
            return response()->json([
                'message' => 'Akun Admin ditemukan. Silakan masukkan password baru.',
                'exists' => true,
                'email' => 'admin@safety.local'
            ], 200);
        }

        if (!$user) {
            return response()->json([
                'message' => 'Akun dengan Email atau NRP tersebut tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'message' => 'Akun ditemukan. Silakan buat password baru Anda.',
            'exists' => true,
            'email' => $user->email,
            'name' => $user->name,
        ], 200);
    }

    /**
     * Reset Password Baru
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string|min:6',
        ], [
            'email.required' => 'Email atau NRP wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
        ]);

        $identifier = $request->email;
        $newPasswordHash = Hash::make($request->password);

        $user = User::where('email', $identifier)
            ->orWhere('nrp', $identifier)
            ->first();

        if ($user) {
            $user->password = $newPasswordHash;
            $user->save();
        } else if ($identifier === 'admin@safety.local' || $identifier === '12345678') {
            User::updateOrCreate(
                ['email' => 'admin@safety.local'],
                [
                    'name' => 'Admin Safety',
                    'nrp' => '12345678',
                    'no_wa' => '081234567890',
                    'password' => $newPasswordHash,
                    'role' => 'admin'
                ]
            );
        } else {
            return response()->json([
                'message' => 'Akun tidak ditemukan untuk diperbarui.'
            ], 404);
        }

        return response()->json([
            'message' => 'Password berhasil diperbarui! Silakan login dengan password baru.'
        ], 200);
    }
}

