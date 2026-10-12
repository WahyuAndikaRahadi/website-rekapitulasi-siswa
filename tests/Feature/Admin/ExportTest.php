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
}
