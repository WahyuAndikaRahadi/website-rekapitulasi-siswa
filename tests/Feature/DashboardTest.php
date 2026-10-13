<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/guru/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_admin_can_visit_admin_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
    }

    public function test_authenticated_guru_can_visit_guru_dashboard()
    {
        $guruUser = User::factory()->create(['role' => 'guru']);
        \App\Models\Guru::create([
            'user_id' => $guruUser->id,
            'nama' => $guruUser->name,
        ]);

        $this->actingAs($guruUser)->get('/guru/dashboard')->assertOk();
    }
}
