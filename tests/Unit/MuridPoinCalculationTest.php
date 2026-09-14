<?php

namespace Tests\Unit;

use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MuridPoinCalculationTest extends TestCase
{
    use RefreshDatabase;

    protected Murid $murid;
    protected Guru $guru;
    protected TahunAjaran $tahunAjaran;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tahunAjaran = TahunAjaran::create([
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2026,
            'semester' => 'ganjil',
            'is_aktif' => true,
        ]);

        $user = User::factory()->create(['role' => 'guru']);
        $this->guru = Guru::create([
            'user_id' => $user->id,
            'nama' => 'Guru Test',
            'is_aktif' => true,
        ]);

        $kelas = Kelas::create([
            'nama_kelas' => 'X RPL 1',
            'tingkat' => 'X',
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'wali_kelas_id' => $this->guru->id,
        ]);

        $this->murid = Murid::create([
            'nama' => 'Budi Pratama',
            'nis' => '12345',
            'nisn' => '1234567890',
            'kelas_id' => $kelas->id,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'is_aktif' => true,
        ]);
    }

    public function test_initial_points_are_zero(): void
    {
        $this->assertEquals(0, $this->murid->poinPrestasi());
        $this->assertEquals(0, $this->murid->poinPelanggaranKotor());
        $this->assertEquals(0, $this->murid->poinPelanggaran());
        $this->assertEquals('Sangat Baik', $this->murid->kualifikasiPoin());
        $this->assertNull($this->murid->tahapPembinaan());
    }

    public function test_master_violation_report_auto_applies_points(): void
    {
        Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'tingkat_keparahan' => 'ringan',
            'keterangan' => 'Terlambat 10 menit',
            'poin_diberikan' => -5,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $this->assertEquals(5, $this->murid->poinPelanggaranKotor());
        $this->assertEquals(5, $this->murid->poinPelanggaran());
        $this->assertEquals(0, $this->murid->poinPrestasi());
        $this->assertEquals('Baik', $this->murid->kualifikasiPoin());
        $this->assertEquals('Tahap I (Peringatan Lisan / Wali Kelas & BK)', $this->murid->tahapPembinaan());
    }

    public function test_prestasi_deducts_active_violation_points_simultaneously(): void
    {
        // 1. Student commits 20 points of violation
        Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'tingkat_keparahan' => 'sedang',
            'keterangan' => 'Merokok di area sekolah',
            'poin_diberikan' => -20,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $this->assertEquals(20, $this->murid->poinPelanggaran());
        $this->assertEquals(0, $this->murid->poinPrestasi());

        // 2. Student earns 15 points of Prestasi (e.g., Pengurus OSIS / Lomba)
        Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'prestasi',
            'tingkat_keparahan' => 'sedang',
            'keterangan' => 'Pengurus OSIS Aktif',
            'poin_diberikan' => 15,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        // Poin Prestasi cumulative is 15
        $this->assertEquals(15, $this->murid->poinPrestasi());
        // Gross violation is still 20
        $this->assertEquals(20, $this->murid->poinPelanggaranKotor());
        // Net active violation is reduced: 20 - 15 = 5
        $this->assertEquals(5, $this->murid->poinPelanggaran());
    }

    public function test_net_violation_points_cannot_be_less_than_zero(): void
    {
        // Student has 10 points violation and earns 50 points achievement
        Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'Seragam tidak rapi',
            'poin_diberikan' => -10,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'prestasi',
            'keterangan' => 'Juara 1 LKS Tingkat Provinsi',
            'poin_diberikan' => 50,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $this->assertEquals(50, $this->murid->poinPrestasi());
        $this->assertEquals(10, $this->murid->poinPelanggaranKotor());
        // max(0, 10 - 50) = 0
        $this->assertEquals(0, $this->murid->poinPelanggaran());
        $this->assertEquals('Sangat Baik', $this->murid->kualifikasiPoin());
    }

    public function test_unverified_manual_report_does_not_apply_points_until_verified(): void
    {
        // Manual report submitted
        $laporan = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'Pelanggaran manual khusus',
            'poin_diberikan' => -25,
            'is_manual' => true,
            'status' => 'menunggu verifikasi',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        // Points should NOT apply yet
        $this->assertEquals(0, $this->murid->poinPelanggaran());

        // Admin verifies & approves
        $laporan->update(['status' => 'baru dilaporkan']);

        // Now points apply
        $this->assertEquals(25, $this->murid->poinPelanggaran());
    }

    public function test_rejected_report_does_not_apply_points(): void
    {
        Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'Laporan ditolak',
            'poin_diberikan' => -50,
            'is_manual' => true,
            'status' => 'ditolak',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $this->assertEquals(0, $this->murid->poinPelanggaran());
    }

    public function test_tahap_pembinaan_thresholds(): void
    {
        // Level 1: 1-20 -> Tahap I
        $l1 = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'V1',
            'poin_diberikan' => -15,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);
        $this->assertStringContainsString('Tahap I', $this->murid->tahapPembinaan());

        // Level 2: 21-40 -> Tahap II
        $l2 = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'V2',
            'poin_diberikan' => -15,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);
        // Total 30
        $this->assertStringContainsString('Tahap II', $this->murid->tahapPembinaan());

        // Level 4: 61-80 -> Tahap IV
        $l3 = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'V3',
            'poin_diberikan' => -40,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);
        // Total 70
        $this->assertStringContainsString('Tahap IV', $this->murid->tahapPembinaan());

        // Level 6: >=100 -> Tahap VI
        $l4 = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'V4',
            'poin_diberikan' => -35,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);
        // Total 105
        $this->assertStringContainsString('Tahap VI', $this->murid->tahapPembinaan());
    }
}
