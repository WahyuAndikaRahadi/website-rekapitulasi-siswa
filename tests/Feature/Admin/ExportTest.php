<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Tests\TestCase;

class ExportTest extends TestCase
{
    public function test_admin_can_export_laporan(): void
    {
        $admin = User::where('role', 'admin')->first();
        $response = $this->actingAs($admin)->post('/admin/export/laporan', []);
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_admin_can_export_murid(): void
    {
        $admin = User::where('role', 'admin')->first();
        $response = $this->actingAs($admin)->post('/admin/export/murid', ['status' => 'aktif']);
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }

    public function test_admin_can_export_kelas(): void
    {
        $admin = User::where('role', 'admin')->first();
        $response = $this->actingAs($admin)->post('/admin/export/kelas', []);
        $response->assertOk();
        $this->assertStringContainsString('spreadsheet', $response->headers->get('content-type'));
    }
}
