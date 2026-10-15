<?php

namespace Tests\Feature;

use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Murid;
use App\Models\SuratPanggil;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\NomorSuratGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SuratPanggilanTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Murid $murid;
    private Guru $guru;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $tahun = TahunAjaran::create([
            'label'     => '2025/2026 Ganjil',
            'is_active' => true,
        ]);

        $kelas = Kelas::create([
            'nama_kelas'      => 'XII TO 1',
            'tingkat'         => 'XII',
            'tahun_ajaran_id' => $tahun->id,
        ]);

        $this->murid = Murid::create([
            'nama'            => 'Budi Santoso',
            'nis'             => '21001',
            'nisn'            => '0051234567',
            'kelas_id'        => $kelas->id,
            'tahun_ajaran_id' => $tahun->id,
            'status'          => 'aktif',
            'no_ortu'         => '081234567890',
        ]);

        $guruUser = User::factory()->create(['role' => 'guru']);
        $this->guru = Guru::create([
            'user_id' => $guruUser->id,
            'nama'    => 'Pesta br. Tarigan',
            'nip'     => '196805121994121002',
        ]);
    }

    public function test_nomor_surat_dihasilkan_berurutan_dan_tidak_duplikat(): void
    {
        $generator = new NomorSuratGenerator();

        $data1 = $generator->generate(2026);
        $this->assertEquals('001/PK.01.04', $data1['nomor_surat']);
        $this->assertEquals(1, $data1['nomor_urut']);

        SuratPanggil::create([
            'nomor_surat'       => $data1['nomor_surat'],
            'nomor_urut'        => $data1['nomor_urut'],
            'tahun'             => 2026,
            'murid_id'          => $this->murid->id,
            'nama_guru_menemui' => 'Pesta br. Tarigan',
            'panggilan_ke'      => 1,
            'perihal'           => 'Panggilan I (Satu)',
            'tanggal_panggilan' => '2026-09-25',
            'waktu'             => 'Pukul 09.00 WIB',
            'tempat'            => 'Ruang BK',
            'tanggal_surat'     => '2026-09-21',
        ]);

        $data2 = $generator->generate(2026);
        $this->assertEquals('002/PK.01.04', $data2['nomor_surat']);
        $this->assertEquals(2, $data2['nomor_urut']);
    }

    public function test_format_perihal_romawi_dan_terbilang_sesuai_aturan(): void
    {
        $this->assertEquals('Panggilan I (Satu)', NomorSuratGenerator::formatPerihal(1));
        $this->assertEquals('Panggilan II (Dua)', NomorSuratGenerator::formatPerihal(2));
        $this->assertEquals('Panggilan III (Tiga)', NomorSuratGenerator::formatPerihal(3));
        $this->assertEquals('Panggilan IV (Empat)', NomorSuratGenerator::formatPerihal(4));
    }

    public function test_admin_bisa_membuat_surat_panggilan_melalui_post_request(): void
    {
        Queue::fake();

        $response = $this->actingAs($this->admin)->post('/admin/surat-panggilan', [
            'murid_id'          => $this->murid->id,
            'guru_id'           => $this->guru->id,
            'nama_guru_menemui' => 'Pesta br. Tarigan',
            'tanggal_panggilan' => '2026-09-25',
            'waktu'             => 'Pukul 09.00 WIB',
            'tempat'            => 'Ruang BK SMK Negeri 69 Jakarta',
            'tanggal_surat'     => '2026-09-21',
            'keterangan_kasus'  => 'Pelanggaran atribut dan keterlambatan berulang',
            'kirim_wa'          => true,
        ]);

        $response->assertRedirect('/admin/surat-panggilan');

        $this->assertDatabaseHas('surat_panggils', [
            'murid_id'          => $this->murid->id,
            'panggilan_ke'      => 1,
            'perihal'           => 'Panggilan I (Satu)',
            'nama_guru_menemui' => 'Pesta br. Tarigan',
        ]);
    }

    public function test_pdf_surat_panggilan_berhasil_digenerate_dengan_status_200(): void
    {
        $surat = SuratPanggil::create([
            'nomor_surat'       => '001/PK.01.04',
            'nomor_urut'        => 1,
            'tahun'             => 2026,
            'murid_id'          => $this->murid->id,
            'guru_id'           => $this->guru->id,
            'nama_guru_menemui' => 'Pesta br. Tarigan',
            'panggilan_ke'      => 1,
            'perihal'           => 'Panggilan I (Satu)',
            'tanggal_panggilan' => '2026-09-25',
            'waktu'             => 'Pukul 09.00 WIB',
            'tempat'            => 'Ruang BK SMK Negeri 69 Jakarta',
            'tanggal_surat'     => '2026-09-21',
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/surat-panggilan/{$surat->id}/pdf");

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_guest_tidak_bisa_mengakses_surat_panggilan(): void
    {
        $response = $this->get('/admin/surat-panggilan');
        $response->assertRedirect('/login');
    }
}
