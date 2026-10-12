<?php

namespace App\Exports;

use App\Models\Laporan;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithEvents
{
    private int $rowNumber = 0;

    public function __construct(
        private ?int    $tahunAjaranId = null,
        private ?int    $kelasId       = null,
        private ?string $dari          = null,
        private ?string $sampai        = null,
        private ?string $kategori      = null,
        private ?int    $guruId        = null,
        private ?string $status        = null,
    ) {}

    public function query()
    {
        return Laporan::with(['murid.kelas', 'guru', 'bukti'])
            ->when($this->tahunAjaranId, fn($q) => $q->where('tahun_ajaran_id', $this->tahunAjaranId))
            ->when($this->kelasId,       fn($q) => $q->whereHas('murid', fn($mq) => $mq->where('kelas_id', $this->kelasId)))
            ->when($this->dari,          fn($q) => $q->whereDate('tanggal_kejadian', '>=', $this->dari))
            ->when($this->sampai,        fn($q) => $q->whereDate('tanggal_kejadian', '<=', $this->sampai))
            ->when($this->kategori, function ($q) {
                if ($this->kategori === 'prestasi') {
                    $q->whereIn('kategori', ['prestasi', 'kebaikan']);
                } else {
                    $q->where('kategori', $this->kategori);
                }
            })
            ->when($this->guruId,        fn($q) => $q->where('guru_id', $this->guruId))
            ->when($this->status,        fn($q) => $q->where('status', $this->status))
            ->orderBy('tanggal_kejadian', 'desc')
            ->orderBy('murid_id');
    }

    public function headings(): array
    {
        $jenisLabel = match ($this->kategori) {
            'prestasi'   => 'Jenis Prestasi (Keterangan Prestasi)',
            'pelanggaran'=> 'Jenis Pelanggaran (Keterangan Pelanggaran)',
            default      => 'Kategori & Keterangan Peristiwa',
        };

        return [
            'No',
            'Tanggal',
            'Identitas Pelapor (Guru/Tendik)',
            'No Telp Guru',
            'Nama Murid',
            'No Telp Murid',
            'Kelas',
            $jenisLabel,
            'Kronologi',
            'Angka Poin',
            'Bukti Foto',
            'Status',
        ];
    }

    public function map($laporan): array
    {
        $this->rowNumber++;

        $tingkat    = ucfirst($laporan->tingkat_keparahan ?? '');
        $keterangan = $laporan->keterangan ?? '';
        $jenisKet   = $tingkat ? "{$tingkat} — {$keterangan}" : $keterangan;
        if (!$this->kategori && $laporan->kategori) {
            $jenisKet = '[' . ucfirst($laporan->kategori) . '] ' . $jenisKet;
        }

        $jumlahBukti   = $laporan->bukti->count();
        $buktiFotoText = $jumlahBukti > 0 ? '' : '-';

        $tanggalStr = '-';
        if ($laporan->tanggal_kejadian) {
            try {
                $tanggalStr = \Carbon\Carbon::parse($laporan->tanggal_kejadian)->format('d/m/Y');
            } catch (\Throwable $e) {
                $tanggalStr = (string) $laporan->tanggal_kejadian;
            }
        }

        $poinStr = '-';
        if ($laporan->poin_diberikan !== null) {
            $poinStr = $laporan->poin_diberikan > 0 ? "+{$laporan->poin_diberikan}" : (string) $laporan->poin_diberikan;
        }

        return [
            $this->rowNumber,
            $tanggalStr,
            $laporan->guru->nama ?? '-',
            $laporan->guru->no_telp ?? '-',
            $laporan->murid->nama ?? '-',
            $laporan->murid->no_telp ?? '-',
            $laporan->murid->kelas->nama_kelas ?? '-',
            $jenisKet,
            $laporan->keterangan_tambahan ?? '-',
            $poinStr,
            $buktiFotoText,
            ucwords($laporan->status ?? '-'),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 11],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $laporans = $this->query()->get();

                $totalRows = count($laporans) + 1;
                $sheet->getStyle("A1:L{$totalRows}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER);

                $sheet->getColumnDimension('K')->setWidth(30);

                foreach ($laporans as $index => $laporan) {
                    $rowNumber = $index + 2; // header is row 1

                    if ($laporan->bukti->count() > 0) {
                        $hasDrawing = false;
                        $imgIndex = 0;

                        foreach ($laporan->bukti as $b) {
                            $path = $b->path_file ?? '';
                            if (!empty($path)) {
                                $filePath = Storage::disk('public')->path($path);
                                if (is_file($filePath)) {
                                    $drawing = new Drawing();
                                    $drawing->setName('Bukti Laporan ' . $laporan->id);
                                    $drawing->setDescription($b->nama_asli ?? 'Bukti Foto');
                                    $drawing->setPath($filePath);
                                    $drawing->setHeight(55);
                                    $drawing->setCoordinates('K' . $rowNumber);
                                    $drawing->setOffsetX(5 + ($imgIndex * 60));
                                    $drawing->setOffsetY(5);
                                    $drawing->setWorksheet($sheet);

                                    $hasDrawing = true;
                                    $imgIndex++;
                                }
                            }
                        }

                        if ($hasDrawing) {
                            $sheet->getRowDimension($rowNumber)->setRowHeight(60);
                            if ($imgIndex > 1) {
                                $colWidth = max(30, $imgIndex * 15);
                                $sheet->getColumnDimension('K')->setWidth($colWidth);
                            }
                        }
                    }
                }
            },
        ];
    }
}

