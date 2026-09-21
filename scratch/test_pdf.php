<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$murid = App\Models\Murid::with('kelas')->first();
if (!$murid) {
    $kelas = new App\Models\Kelas(['nama_kelas' => 'XII Teknik Ototronik 2']);
    $murid = new App\Models\Murid([
        'nama' => 'Muhammad Rizky Pratama',
        'nis'  => '202310123',
    ]);
    $murid->setRelation('kelas', $kelas);
}

$surat = new App\Models\SuratPanggil([
    'nomor_surat'       => '001/PK.01.04',
    'nomor_urut'        => 1,
    'tahun'             => 2026,
    'murid_id'          => $murid->id,
    'nama_guru_menemui' => 'Drs. Kiagus Abdurachman',
    'panggilan_ke'      => 1,
    'perihal'           => 'Panggilan I (Satu)',
    'tanggal_panggilan' => '2026-09-25',
    'waktu'             => 'Pukul 09.00 WIB',
    'tempat'            => 'Ruang BK SMK Negeri 69 Jakarta',
    'tanggal_surat'     => '2026-09-21',
]);
$surat->setRelation('murid', $murid);

$pdf = Barryvdh\DomPDF\Facade\Pdf::loadView('surat.panggilan', ['surat' => $surat])->setPaper('a4', 'portrait');
$output = $pdf->output();

$dest = public_path('sample_surat_panggilan.pdf');
file_put_contents($dest, $output);

echo "PDF Generated Successfully: " . filesize($dest) . " bytes\n";
