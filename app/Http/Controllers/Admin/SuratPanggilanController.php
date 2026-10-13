<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSuratPanggilanRequest;
use App\Models\Guru;
use App\Models\Murid;
use App\Models\SuratPanggil;
use App\Services\NomorSuratGenerator;
use App\Services\WhatsAppService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class SuratPanggilanController extends Controller
{
    /**
     * Tampilkan riwayat surat pemanggilan orang tua.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $suratQuery = SuratPanggil::query()
            ->with(['murid.kelas', 'guru', 'creator'])
            ->when($search, function ($query, $term) {
                $query->where('nomor_surat', 'like', "%{$term}%")
                    ->orWhere('perihal', 'like', "%{$term}%")
                    ->orWhere('nama_guru_menemui', 'like', "%{$term}%")
                    ->orWhereHas('murid', function ($mq) use ($term) {
                        $mq->where('nama', 'like', "%{$term}%")
                           ->orWhere('nis', 'like', "%{$term}%");
                    });
            })
            ->orderByDesc('id');

        $suratList = $suratQuery->paginate(15)->withQueryString();

        $muridList = Murid::aktif()
            ->with('kelas')
            ->orderBy('nama')
            ->get(['id', 'nama', 'nis', 'kelas_id', 'no_ortu', 'no_telp']);

        $guruList = Guru::orderBy('nama')->get(['id', 'nama', 'nip']);

        return Inertia::render('admin/surat-panggilan/index', [
            'suratList'      => $suratList,
            'muridList'      => $muridList,
            'guruList'       => $guruList,
            'filters'        => [
                'search' => $search,
            ],
            'defaultTempat'  => config('sekolah.surat_panggilan.tempat_default', 'Ruang BK SMK Negeri 69 Jakarta'),
            'defaultWaktu'   => config('sekolah.surat_panggilan.waktu_default', 'Pukul 09.00 WIB'),
        ]);
    }

    /**
     * Hitung panggilan_ke dan perihal rekomendasi untuk murid yang dipilih (API/JSON).
     */
    public function infoMurid(Murid $murid, NomorSuratGenerator $generator)
    {
        $panggilanKe = $generator->hitungPanggilanKe($murid->id);
        $perihal = NomorSuratGenerator::formatPerihal($panggilanKe);

        return response()->json([
            'murid'        => $murid->load('kelas'),
            'panggilan_ke' => $panggilanKe,
            'perihal'      => $perihal,
            'poin'         => $murid->poinPelanggaran(),
            'tahap'        => $murid->tahapPembinaan(),
        ]);
    }

    /**
     * Simpan Surat Pemanggilan Orang Tua baru & kirim notifikasi WA bila diminta.
     */
    public function store(
        StoreSuratPanggilanRequest $request,
        NomorSuratGenerator $generator,
        WhatsAppService $whatsAppService
    ) {
        $validated = $request->validated();

        // Idempotency: cegah double submit dalam 15 detik terakhir untuk murid dan tanggal yang sama
        $cacheKey = "surat_idempotency_{$validated['murid_id']}_{$validated['tanggal_panggilan']}";
        if (!Cache::add($cacheKey, true, 15)) {
            return redirect()->route('admin.surat-panggilan.index')
                ->with('info', 'Surat pemanggilan untuk siswa dan tanggal ini sedang diproses atau sudah diterbitkan baru-baru ini.');
        }

        $tahunSurat = !empty($validated['tanggal_surat'])
            ? (int) date('Y', strtotime($validated['tanggal_surat']))
            : (int) date('Y');

        // Generate nomor surat unik berurutan
        $nomorData = $generator->generate($tahunSurat);

        // Tentukan panggilan_ke dan perihal
        $panggilanKe = $validated['panggilan_ke'] ?? $generator->hitungPanggilanKe($validated['murid_id']);
        $perihal = NomorSuratGenerator::formatPerihal($panggilanKe);

        // Resolve nama guru yang menemui jika dipilih dari dropdown guru
        $namaGuru = $validated['nama_guru_menemui'];
        if (!empty($validated['guru_id'])) {
            $guru = Guru::find($validated['guru_id']);
            if ($guru && empty($namaGuru)) {
                $namaGuru = $guru->nama;
            }
        }

        $surat = SuratPanggil::create([
            'nomor_surat'       => $nomorData['nomor_surat'],
            'nomor_urut'        => $nomorData['nomor_urut'],
            'tahun'             => $nomorData['tahun'],
            'murid_id'          => $validated['murid_id'],
            'guru_id'           => $validated['guru_id'] ?? null,
            'nama_guru_menemui' => $namaGuru,
            'panggilan_ke'      => $panggilanKe,
            'perihal'           => $perihal,
            'tanggal_panggilan' => $validated['tanggal_panggilan'],
            'waktu'             => $validated['waktu'],
            'tempat'            => $validated['tempat'],
            'tanggal_surat'     => $validated['tanggal_surat'],
            'keterangan_kasus'  => $validated['keterangan_kasus'] ?? null,
            'created_by'        => auth()->id(),
        ]);

        // Kirim WhatsApp notification jika opsi kirim_wa aktif (default true)
        if ($request->boolean('kirim_wa', true)) {
            $whatsAppService->sendSuratPanggilanNotification($surat);
        }

        return redirect()->route('admin.surat-panggilan.index')
            ->with('success', "Surat Pemanggilan {$surat->nomor_surat} ({$surat->perihal}) berhasil diterbitkan.");
    }

    /**
     * Preview / Stream PDF di browser.
     */
    public function previewPdf(SuratPanggil $suratPanggil)
    {
        $suratPanggil->load(['murid.kelas', 'guru']);

        $pdf = Pdf::loadView('surat.panggilan', [
            'surat' => $suratPanggil,
        ])->setPaper('a4', 'portrait');

        $safeNomor = str_replace(['/', '\\'], '-', $suratPanggil->nomor_surat);
        return $pdf->stream("Surat-Panggilan-{$safeNomor}.pdf");
    }

    /**
     * Unduh file PDF secara langsung.
     */
    public function downloadPdf(SuratPanggil $suratPanggil)
    {
        $suratPanggil->load(['murid.kelas', 'guru']);

        $pdf = Pdf::loadView('surat.panggilan', [
            'surat' => $suratPanggil,
        ])->setPaper('a4', 'portrait');

        $safeNomor = str_replace(['/', '\\'], '-', $suratPanggil->nomor_surat);
        return $pdf->download("Surat-Panggilan-{$safeNomor}.pdf");
    }

    /**
     * Kirim ulang notifikasi WhatsApp surat pemanggilan ke orang tua.
     */
    public function kirimWa(SuratPanggil $suratPanggil, WhatsAppService $whatsAppService)
    {
        $suratPanggil->load(['murid.kelas', 'guru']);

        $targetPhone = $suratPanggil->murid?->no_ortu ?: $suratPanggil->murid?->no_telp;

        if (empty($targetPhone)) {
            return back()->with('error', "Gagal: Nomor WhatsApp orang tua belum terdaftar pada data siswa {$suratPanggil->murid?->nama}.");
        }

        // Kirim langsung (sync) agar feedback di UI akurat dan realtime
        $success = $whatsAppService->sendSuratPanggilanNotification($suratPanggil, true);

        if ($success) {
            return back()->with('success', "Notifikasi WhatsApp untuk surat {$suratPanggil->nomor_surat} berhasil dikirim ke orang tua ({$targetPhone}).");
        }

        return back()->with('error', "Gagal mengirim notifikasi WhatsApp. Pastikan WhatsApp Gateway aktif dan terhubung.");
    }

    /**
     * Hapus arsip surat panggilan.
     */
    public function destroy(SuratPanggil $suratPanggil)
    {
        $nomor = $suratPanggil->nomor_surat;
        $suratPanggil->delete();

        return redirect()->route('admin.surat-panggilan.index')
            ->with('success', "Surat {$nomor} berhasil dihapus.");
    }
}
