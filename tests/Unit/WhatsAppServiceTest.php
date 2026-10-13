<?php

namespace Tests\Unit;

use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Services\WhatsAppService;
use Tests\TestCase;

class WhatsAppServiceTest extends TestCase
{
    public function test_it_formats_phone_numbers_correctly(): void
    {
        $this->assertEquals('628123456789', WhatsAppService::formatPhoneNumber('08123456789'));
        $this->assertEquals('628123456789', WhatsAppService::formatPhoneNumber('8123456789'));
        $this->assertEquals('628123456789', WhatsAppService::formatPhoneNumber('+62 812-3456-789'));
        $this->assertEquals('6281234567890', WhatsAppService::formatPhoneNumber('6281234567890'));
        $this->assertEquals('', WhatsAppService::formatPhoneNumber(null));
        $this->assertEquals('', WhatsAppService::formatPhoneNumber(''));
    }

    public function test_it_formats_pelanggaran_message_correctly(): void
    {
        $service = new WhatsAppService();

        $murid = new Murid([
            'nama' => 'Budi Santoso',
            'nis'  => '20241001',
        ]);
        $murid->setRelation('kelas', new Kelas(['nama_kelas' => 'X SIJA 1']));

        $laporan = new Laporan([
            'keterangan'       => 'Terlambat masuk sekolah',
            'poin_diberikan'   => -5,
            'tanggal_kejadian' => now(),
            'kategori'         => 'pelanggaran',
        ]);

        $message = $service->formatPelanggaranMessage($murid, $laporan, 0, 5);

        $this->assertStringContainsString('PEMBERITAHUAN CATATAN KEDISIPLINAN SISWA', $message);
        $this->assertStringContainsString('Budi Santoso', $message);
        $this->assertStringContainsString('X SIJA 1', $message);
        $this->assertStringContainsString('Terlambat masuk sekolah', $message);
        $this->assertStringContainsString('+5 Poin', $message);
    }

    public function test_it_formats_prestasi_message_correctly(): void
    {
        $service = new WhatsAppService();

        $murid = new Murid([
            'nama' => 'Siti Nurhaliza',
            'nis'  => '20241002',
        ]);
        $murid->setRelation('kelas', new Kelas(['nama_kelas' => 'XI SIJA 1']));

        $laporan = new Laporan([
            'keterangan'       => 'Juara 1 Lomba Web Design',
            'poin_diberikan'   => 20,
            'tanggal_kejadian' => now(),
            'kategori'         => 'prestasi',
        ]);

        $message = $service->formatPrestasiMessage($murid, $laporan, 0, 20);

        $this->assertStringContainsString('APRESIASI PRESTASI & PERILAKU POSITIF SISWA', $message);
        $this->assertStringContainsString('Siti Nurhaliza', $message);
        $this->assertStringContainsString('XI SIJA 1', $message);
        $this->assertStringContainsString('Juara 1 Lomba Web Design', $message);
        $this->assertStringContainsString('+20 Poin', $message);
    }

    public function test_it_formats_surat_panggilan_message_correctly(): void
    {
        $service = new WhatsAppService();

        $murid = new Murid([
            'nama' => 'Ahmad Fauzi',
            'nis'  => '20241003',
        ]);
        $murid->setRelation('kelas', new Kelas(['nama_kelas' => 'XII SIJA 2']));

        $surat = new \App\Models\SuratPanggil([
            'nomor_surat'        => '001/SMKN69/SP-1/2026',
            'perihal'            => 'Panggilan I (SP-1)',
            'waktu'              => '09:00 WIB',
            'tempat'             => 'Ruang BK',
            'nama_guru_menemui'  => 'Ibu Sri Handayani',
            'tanggal_panggilan'  => now(),
        ]);
        $surat->setRelation('murid', $murid);

        $message = $service->formatSuratPanggilanMessage($surat);

        $this->assertStringContainsString('SURAT PEMANGGILAN ORANG TUA / WALI SISWA', $message);
        $this->assertStringContainsString('Ahmad Fauzi', $message);
        $this->assertStringContainsString('Panggilan I (SP-1)', $message);
    }
}
