<?php

namespace Database\Seeders;

use App\Models\Kelas;
use App\Models\Murid;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MuridSeeder extends Seeder
{
    public function run(): void
    {
        $tahunAjaran = TahunAjaran::first();
        $tahunAjaranId = $tahunAjaran?->id;

        // 1. Ekstraksi data siswa (Prioritas: public/data-siswa (2).xlsx -> public/data-siswa.xlsx -> file array lokal)
        $rawStudents = $this->loadStudentData();

        if (empty($rawStudents)) {
            $this->command->error('Tidak ada data siswa yang dapat dimuat. Pastikan file Excel atau file data siswa tersedia.');
            return;
        }

        // 2. Hapus data dummy faker lama jika ada (NIS dummy 8 digit berawalan 20241xxx)
        Murid::where('nis', 'like', '20241%')->whereRaw('LENGTH(nis) = 8')->forceDelete();

        // 3. Cache dan siapkan pemetaan kelas
        $kelasMap = Kelas::pluck('id', 'nama_kelas')->all();

        $aktifCount = 0;
        $alumniCount = 0;

        DB::transaction(function () use ($rawStudents, $tahunAjaranId, &$kelasMap, &$aktifCount, &$alumniCount) {
            foreach ($rawStudents as $item) {
                $nis   = !empty($item['nis']) ? trim((string) $item['nis']) : null;
                $nama  = trim((string) $item['nama']);
                $kelas = trim((string) ($item['kelas'] ?? ''));

                if ($nama === '') {
                    continue;
                }

                $isAlumni = (strtoupper($kelas) === 'ALUMNI');
                $kelasId = null;

                if (!$isAlumni && $kelas !== '') {
                    // Pastikan kelas terdaftar di master kelas
                    if (!isset($kelasMap[$kelas])) {
                        $tingkat = explode(' ', $kelas)[0] ?? 'X';
                        $newKelas = Kelas::firstOrCreate(
                            ['nama_kelas' => $kelas],
                            [
                                'tingkat'         => $tingkat,
                                'tahun_ajaran_id' => $tahunAjaranId,
                            ]
                        );
                        $kelasMap[$kelas] = $newKelas->id;
                    }
                    $kelasId = $kelasMap[$kelas];
                    $aktifCount++;
                } else {
                    $alumniCount++;
                }

                // Sesuai permintaan: biarkan kosong data no hp dan nis/nisn jika tidak ada di excel
                Murid::updateOrCreate(
                    [
                        'nis' => $nis,
                    ],
                    [
                        'nama'            => $nama,
                        'nisn'            => null,
                        'no_telp'         => null,
                        'no_ortu'         => null,
                        'status'          => $isAlumni ? 'alumni' : 'aktif',
                        'kelas_id'        => $kelasId,
                        'tahun_ajaran_id' => $isAlumni ? null : $tahunAjaranId,
                    ]
                );
            }
        });

        $totalCount = $aktifCount + $alumniCount;
        $this->command->info("Berhasil mengimpor {$totalCount} data siswa production SMKN 69 Jakarta ({$aktifCount} siswa aktif, {$alumniCount} alumni).");
    }

    /**
     * Membaca data siswa dari file Excel utama atau fallback ke data PHP statis.
     *
     * @return array<int, array{nis: ?string, nama: string, kelas: string}>
     */
    protected function loadStudentData(): array
    {
        $possibleExcelPaths = [
            public_path('data-siswa (2).xlsx'),
            public_path('data-siswa.xlsx'),
        ];

        foreach ($possibleExcelPaths as $excelPath) {
            if (file_exists($excelPath)) {
                try {
                    return $this->parseExcelFile($excelPath);
                } catch (\Throwable $e) {
                    $this->command->warn("Gagal membaca {$excelPath}: {$e->getMessage()}. Mencoba sumber data lain...");
                }
            }
        }

        // Fallback: file data yang sudah diekstrak
        $fallbackFile = __DIR__ . '/data/siswa_production.php';
        if (file_exists($fallbackFile)) {
            return require $fallbackFile;
        }

        return [];
    }

    /**
     * Parsing file Excel data siswa SMKN 69 Jakarta.
     */
    protected function parseExcelFile(string $filePath): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getActiveSheet();
        $highestRow = $sheet->getHighestRow();

        $students = [];
        for ($row = 2; $row <= $highestRow; $row++) {
            $nis   = trim((string) $sheet->getCell("B$row")->getValue());
            $nama  = trim((string) $sheet->getCell("C$row")->getValue());
            $kelas = trim((string) $sheet->getCell("E$row")->getValue());

            if ($nama === '') {
                continue;
            }

            $students[] = [
                'nis'   => $nis !== '' ? $nis : null,
                'nama'  => $nama,
                'kelas' => $kelas,
            ];
        }

        return $students;
    }
}
