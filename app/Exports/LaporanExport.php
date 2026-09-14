<?php

namespace App\Exports;

use App\Models\Laporan;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function __construct(
        private int     $tahunAjaranId,
        private ?int    $kelasId = null,
        private ?string $dari    = null,
        private ?string $sampai  = null,
    ) {}

    public function query()
    {
        return Laporan::with(['murid.kelas', 'guru'])
            ->where('tahun_ajaran_id', $this->tahunAjaranId)
            ->when($this->kelasId, fn($q) => $q->whereHas('murid', fn($mq) => $mq->where('kelas_id', $this->kelasId)))
            ->when($this->dari,    fn($q) => $q->whereDate('tanggal_kejadian', '>=', $this->dari))
            ->when($this->sampai,  fn($q) => $q->whereDate('tanggal_kejadian', '<=', $this->sampai))
            ->orderBy('tanggal_kejadian')
            ->orderBy('murid_id');
    }

    public function headings(): array
    {
        return [
            'No', 'Tanggal', 'Nama Murid', 'NIS', 'Kelas',
            'Kategori', 'Tingkat', 'Keterangan', 'Poin', 'Status', 'Dilaporkan Oleh', 'Tindak Lanjut',
        ];
    }

    public function map($laporan): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $laporan->tanggal_kejadian->format('d/m/Y'),
            $laporan->murid->nama,
            $laporan->murid->nis ?? '-',
            $laporan->murid->kelas->nama_kelas,
            $laporan->kategori === 'pelanggaran' ? 'Pelanggaran' : 'Prestasi',
            ucfirst($laporan->tingkat_keparahan ?? '-'),
            $laporan->keterangan,
            $laporan->poin_diberikan,
            ucwords($laporan->status),
            $laporan->guru->nama,
            $laporan->tindak_lanjut ?? '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
