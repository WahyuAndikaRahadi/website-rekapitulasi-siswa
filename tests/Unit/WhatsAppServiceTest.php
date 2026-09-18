<?php

namespace Tests\Unit;

use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Services\WhatsAppService;
use PHPUnit\Framework\TestCase;

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
}
