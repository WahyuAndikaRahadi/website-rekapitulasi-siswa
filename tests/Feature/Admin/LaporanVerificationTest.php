<?php

namespace Tests\Feature\Admin;

use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LaporanVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $guruUser;
    protected Guru $guru;
    protected Murid $murid;
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

        $this->adminUser = User::factory()->create(['role' => 'admin']);
        $this->guruUser = User::factory()->create(['role' => 'guru']);

        $this->guru = Guru::create([
            'user_id' => $this->guruUser->id,
            'nama' => 'Guru Penguji',
            'is_aktif' => true,
        ]);

        $kelas = Kelas::create([
            'nama_kelas' => 'XII RPL 2',
            'tingkat' => 'XII',
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'wali_kelas_id' => $this->guru->id,
        ]);

        $this->murid = Murid::create([
            'nama' => 'Ahmad Santoso',
            'nis' => '67890',
            'kelas_id' => $kelas->id,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'is_aktif' => true,
        ]);
    }

    public function test_guru_stores_master_report_is_auto_applied(): void
    {
        $response = $this->actingAs($this->guruUser)
            ->post('/guru/laporan', [
                'murid_id' => $this->murid->id,
                'kategori' => 'pelanggaran',
                'tingkat_keparahan' => 'ringan',
                'keterangan' => 'Tidak memakai dasi saat upacara',
                'is_manual' => false,
                'poin_diberikan' => -5,
                'tanggal_kejadian' => now()->toDateString(),
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('laporans', [
            'murid_id' => $this->murid->id,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'poin_diberikan' => -5,
        ]);

        $this->assertEquals(5, $this->murid->poinPelanggaran());
    }

    public function test_guru_stores_manual_report_requires_verification(): void
    {
        $response = $this->actingAs($this->guruUser)
            ->post('/guru/laporan', [
                'murid_id' => $this->murid->id,
                'kategori' => 'pelanggaran',
                'tingkat_keparahan' => 'sedang',
                'keterangan' => 'Pelanggaran manual di luar daftar master',
                'is_manual' => true,
                'poin_diberikan' => -20,
                'tanggal_kejadian' => now()->toDateString(),
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('laporans', [
            'murid_id' => $this->murid->id,
            'is_manual' => true,
            'status' => 'menunggu verifikasi',
        ]);

        // Points not yet applied
        $this->assertEquals(0, $this->murid->poinPelanggaran());
    }

    public function test_admin_can_update_status_via_patch_route(): void
    {
        $laporan = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'Terlambat',
            'poin_diberikan' => -5,
            'is_manual' => false,
            'status' => 'baru dilaporkan',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch("/admin/laporan/{$laporan->id}/status", [
                'status' => 'pembinaan tindak lanjut',
            ]);

        $response->assertRedirect();
        $this->assertEquals('pembinaan tindak lanjut', $laporan->fresh()->status);

        // Status can be set to 'selesai'
        $this->actingAs($this->adminUser)
            ->patch("/admin/laporan/{$laporan->id}/status", [
                'status' => 'selesai',
            ]);
        $this->assertEquals('selesai', $laporan->fresh()->status);
    }

    public function test_admin_verifies_and_approves_manual_report(): void
    {
        $laporan = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'prestasi',
            'keterangan' => 'Juara Olimpiade Sains Nasional',
            'poin_diberikan' => 50,
            'is_manual' => true,
            'status' => 'menunggu verifikasi',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        // Prior to verification
        $this->assertEquals(0, $this->murid->poinPrestasi());

        $response = $this->actingAs($this->adminUser)
            ->post("/admin/laporan/{$laporan->id}/tindak-lanjut", [
                'tindakan' => 'setujui',
                'poin_diberikan' => 50,
                'tingkat_keparahan' => 'berat',
            ]);

        $response->assertRedirect();
        $this->assertEquals('baru dilaporkan', $laporan->fresh()->status);
        $this->assertEquals(50, $this->murid->poinPrestasi());
    }

    public function test_admin_rejects_manual_report(): void
    {
        $laporan = Laporan::create([
            'guru_id' => $this->guru->id,
            'murid_id' => $this->murid->id,
            'kategori' => 'pelanggaran',
            'keterangan' => 'Pelanggaran manual yang tidak valid',
            'poin_diberikan' => -30,
            'is_manual' => true,
            'status' => 'menunggu verifikasi',
            'tanggal_kejadian' => now()->toDateString(),
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post("/admin/laporan/{$laporan->id}/tindak-lanjut", [
                'tindakan' => 'tolak',
                'alasan_penolakan' => 'Bukti foto tidak sesuai dengan siswa bersangkutan.',
            ]);

        $response->assertRedirect();
        $this->assertEquals('ditolak', $laporan->fresh()->status);
        $this->assertEquals(0, $this->murid->poinPelanggaran());
    }
}
