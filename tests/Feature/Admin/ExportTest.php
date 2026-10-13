<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Tests\TestCase;

class ExportTest extends TestCase
{
    private function getAdmin(): User
    {
        return User::firstOrCreate(
            ['email' => 'admin@sekolah.test'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }

    public function test_admin_can_export_laporan(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)->post('/admin/export/laporan', []);
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_admin_can_export_murid(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)->post('/admin/export/murid', ['status' => 'aktif']);
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_admin_can_export_kelas(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)->post('/admin/export/kelas', []);
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_export_laporan_validates_date_order(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)
            ->postJson('/admin/export/laporan', [
                'dari' => '2026-10-20',
                'sampai' => '2026-10-10',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['sampai']);
        $this->assertEquals(
            'Tanggal akhir harus sama dengan atau setelah tanggal awal.',
            $response->json('errors.sampai.0')
        );
    }

    public function test_export_murid_validates_status(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)
            ->postJson('/admin/export/murid', [
                'status' => 'invalid_status',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status']);
    }

    public function test_admin_can_export_laporan_via_get(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)->get('/admin/export/laporan?kategori=prestasi');
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_admin_can_export_murid_via_get(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)->get('/admin/export/murid?status=aktif');
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_admin_can_export_kelas_via_get(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)->get('/admin/export/kelas');
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_export_laporan_validates_date_order_via_get(): void
    {
        $admin = $this->getAdmin();
        $response = $this->actingAs($admin)
            ->getJson('/admin/export/laporan?dari=2026-10-20&sampai=2026-10-10');

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['sampai']);
        $this->assertEquals(
            'Tanggal akhir harus sama dengan atau setelah tanggal awal.',
            $response->json('errors.sampai.0')
        );
    }
}
