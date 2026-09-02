<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * Tersedia di semua halaman via usePage().props
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $guruData = null;

        if ($user && $user->isGuru()) {
            $guru = $user->guru()->with('waliKelasKelas')->first();
            if ($guru) {
                $guruData = [
                    'id'             => $guru->id,
                    'nama'           => $guru->nama,
                    'nip'            => $guru->nip,
                    'is_wali_kelas'  => $guru->isWaliKelas(),
                    'wali_kelas'     => $guru->waliKelasKelas ? [
                        'id'         => $guru->waliKelasKelas->id,
                        'nama_kelas' => $guru->waliKelasKelas->nama_kelas,
                    ] : null,
                ];
            }
        }

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => $user->role,
                ] : null,
                'guru' => $guruData,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ]);
    }
}
