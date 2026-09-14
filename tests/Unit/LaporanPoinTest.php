<?php

namespace Tests\Unit;

use App\Models\Laporan;
use PHPUnit\Framework\TestCase;

class LaporanPoinTest extends TestCase
{
    public function test_poin_ranges_constant_has_correct_structure(): void
    {
        $ranges = Laporan::POIN_RANGES;

        $this->assertArrayHasKey('pelanggaran', $ranges);
        $this->assertArrayHasKey('prestasi', $ranges);
        $this->assertArrayHasKey('kebaikan', $ranges);

        foreach (['pelanggaran', 'prestasi', 'kebaikan'] as $kat) {
            foreach (['ringan', 'sedang', 'berat'] as $tingkat) {
                $this->assertArrayHasKey($tingkat, $ranges[$kat], "Missing {$kat}/{$tingkat}");
                $this->assertArrayHasKey('min', $ranges[$kat][$tingkat]);
                $this->assertArrayHasKey('max', $ranges[$kat][$tingkat]);
            }
        }
    }

    public function test_pelanggaran_ranges_are_negative(): void
    {
        foreach (Laporan::POIN_RANGES['pelanggaran'] as $tingkat => $range) {
            $this->assertLessThan(0, $range['min'], "Pelanggaran {$tingkat} min should be negative");
            $this->assertLessThan(0, $range['max'], "Pelanggaran {$tingkat} max should be negative");
        }
    }

    public function test_prestasi_ranges_are_positive(): void
    {
        foreach (Laporan::POIN_RANGES['prestasi'] as $tingkat => $range) {
            $this->assertGreaterThan(0, $range['min'], "Prestasi {$tingkat} min should be positive");
            $this->assertGreaterThan(0, $range['max'], "Prestasi {$tingkat} max should be positive");
        }
    }

    public function test_poin_range_hint_returns_correct_format(): void
    {
        $this->assertEquals('-5 s/d -10', Laporan::poinRangeHint('pelanggaran', 'ringan'));
        $this->assertEquals('-11 s/d -25', Laporan::poinRangeHint('pelanggaran', 'sedang'));
        $this->assertEquals('-26 s/d -50', Laporan::poinRangeHint('pelanggaran', 'berat'));
        $this->assertEquals('5 s/d 10', Laporan::poinRangeHint('prestasi', 'ringan'));
        $this->assertEquals('11 s/d 25', Laporan::poinRangeHint('prestasi', 'sedang'));
        $this->assertEquals('26 s/d 50', Laporan::poinRangeHint('prestasi', 'berat'));
    }

    public function test_poin_range_hint_returns_question_mark_for_invalid(): void
    {
        $this->assertEquals('?', Laporan::poinRangeHint('invalid', 'ringan'));
        $this->assertEquals('?', Laporan::poinRangeHint('pelanggaran', 'invalid_level'));
    }
}
