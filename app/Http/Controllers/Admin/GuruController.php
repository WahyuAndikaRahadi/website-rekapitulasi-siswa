<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class GuruController extends Controller
{
    public function index(): Response
    {
        $gurus = Guru::with(['user', 'waliKelasKelas'])->orderBy('nama')->get();

        return Inertia::render('admin/guru/index', [
            'gurus' => $gurus->map(fn($g) => [
                'id'         => $g->id,
                'nama'       => $g->nama,
                'nip'        => $g->nip,
                'email'      => $g->user->email,
                'wali_kelas' => $g->waliKelasKelas?->nama_kelas,
            ]),
        ]);
    }

    public function create(): Response
    {
        $tahunAjaran = TahunAjaran::aktif();

        return Inertia::render('admin/guru/form', [
            'guru'       => null,
            'kelas_list' => Kelas::where('tahun_ajaran_id', $tahunAjaran?->id)->orderBy('nama_kelas')->get(['id', 'nama_kelas']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama'           => ['required', 'string', 'max:100'],
            'nip'            => ['nullable', 'string', 'max:30'],
            'email'          => ['required', 'email', 'unique:users,email'],
            'password'       => ['required', 'string', 'min:8'],
            'wali_kelas_id'  => ['nullable', 'exists:kelas,id'],
        ], [
            'nama.required'     => 'Nama harus diisi.',
            'email.required'    => 'Email harus diisi.',
            'email.unique'      => 'Email sudah terdaftar.',
            'password.required' => 'Password harus diisi.',
            'password.min'      => 'Password minimal 8 karakter.',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name'     => $validated['nama'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'guru',
                'email_verified_at' => now(),
            ]);

            Guru::create([
                'user_id'        => $user->id,
                'nama'           => $validated['nama'],
                'nip'            => $validated['nip'] ?? null,
                'wali_kelas_id'  => $validated['wali_kelas_id'] ?? null,
            ]);
        });

        return redirect()->route('admin.guru.index')
            ->with('success', 'Akun guru berhasil dibuat.');
    }

    public function edit(Guru $guru): Response
    {
        $tahunAjaran = TahunAjaran::aktif();
        $guru->load('user');

        return Inertia::render('admin/guru/form', [
            'guru' => [
                'id'            => $guru->id,
                'nama'          => $guru->nama,
                'nip'           => $guru->nip,
                'email'         => $guru->user->email,
                'wali_kelas_id' => $guru->wali_kelas_id,
            ],
            'kelas_list' => Kelas::where('tahun_ajaran_id', $tahunAjaran?->id)->orderBy('nama_kelas')->get(['id', 'nama_kelas']),
        ]);
    }

    public function update(Request $request, Guru $guru): RedirectResponse
    {
        $validated = $request->validate([
            'nama'          => ['required', 'string', 'max:100'],
            'nip'           => ['nullable', 'string', 'max:30'],
            'email'         => ['required', 'email', 'unique:users,email,' . $guru->user_id],
            'password'      => ['nullable', 'string', 'min:8'],
            'wali_kelas_id' => ['nullable', 'exists:kelas,id'],
        ]);

        DB::transaction(function () use ($validated, $guru) {
            $userUpdate = [
                'name'  => $validated['nama'],
                'email' => $validated['email'],
            ];
            if (!empty($validated['password'])) {
                $userUpdate['password'] = Hash::make($validated['password']);
            }
            $guru->user->update($userUpdate);

            $guru->update([
                'nama'          => $validated['nama'],
                'nip'           => $validated['nip'] ?? null,
                'wali_kelas_id' => $validated['wali_kelas_id'] ?? null,
            ]);
        });

        return redirect()->route('admin.guru.index')
            ->with('success', 'Data guru berhasil diperbarui.');
    }

    public function destroy(Guru $guru): RedirectResponse
    {
        DB::transaction(function () use ($guru) {
            $guru->user->delete(); // cascade ke tabel guru via FK
        });

        return redirect()->route('admin.guru.index')
            ->with('success', 'Akun guru berhasil dihapus.');
    }

    public function mappingKelas(Guru $guru): Response
    {
        $tahunAjaran = TahunAjaran::aktif();
        $guru->load('kelas');

        return Inertia::render('admin/guru/mapping-kelas', [
            'guru' => [
                'id'   => $guru->id,
                'nama' => $guru->nama,
            ],
            'kelas_list' => Kelas::where('tahun_ajaran_id', $tahunAjaran?->id)
                ->orderBy('nama_kelas')
                ->get(['id', 'nama_kelas']),
            'kelas_diampu' => $guru->kelas->map(fn($k) => [
                'kelas_id' => $k->id,
                'mapel'    => $k->pivot->mapel,
            ]),
        ]);
    }

    public function syncMappingKelas(Request $request, Guru $guru): RedirectResponse
    {
        $request->validate([
            'kelas'          => ['nullable', 'array'],
            'kelas.*.kelas_id' => ['required', 'exists:kelas,id'],
            'kelas.*.mapel'    => ['nullable', 'string', 'max:100'],
        ]);

        $syncData = [];
        foreach ($request->get('kelas', []) as $item) {
            $syncData[$item['kelas_id']] = ['mapel' => $item['mapel'] ?? null];
        }

        $guru->kelas()->sync($syncData);

        return redirect()->route('admin.guru.index')
            ->with('success', 'Mapping kelas berhasil diperbarui.');
    }
}
