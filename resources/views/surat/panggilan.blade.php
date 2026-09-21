@php
    use Carbon\Carbon;
    
    // Set locale to Indonesian
    Carbon::setLocale('id');

    $tglPanggilan = $surat->tanggal_panggilan ? Carbon::parse($surat->tanggal_panggilan)->locale('id') : Carbon::now()->locale('id');
    $hariTanggal = $tglPanggilan->translatedFormat('l, d F Y');

    $tglSurat = $surat->tanggal_surat ? Carbon::parse($surat->tanggal_surat)->locale('id') : Carbon::now()->locale('id');
    $tanggalSuratFormat = $tglSurat->translatedFormat('d F Y');

    $kepsek = config('sekolah.pejabat.kepala_sekolah');
    $wakasis = config('sekolah.pejabat.wakil_kesiswaan');
    $lampiran = config('sekolah.surat_panggilan.lampiran', '-');
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Pemanggilan Orang Tua - {{ $surat->nomor_surat }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 1.2cm 2cm 1.2cm 2cm;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
        }

        .table-full {
            width: 100%;
            border-collapse: collapse;
        }

        .table-full td {
            vertical-align: top;
            padding: 1px 0;
        }

        .content-p {
            text-align: justify;
            margin-top: 14px;
            margin-bottom: 12px;
            line-height: 1.45;
        }

        .table-jadwal {
            width: 100%;
            border-collapse: collapse;
            margin-left: 24px;
            margin-top: 6px;
            margin-bottom: 10px;
        }

        .table-jadwal td {
            vertical-align: top;
            padding: 3px 0;
            font-size: 11pt;
        }

        .ttd-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
        }

        .ttd-table td {
            vertical-align: top;
            width: 50%;
        }

        .underline {
            text-decoration: underline;
        }

        .bold {
            font-weight: bold;
        }
    </style>
</head>
<body>

    {{-- KOP SURAT --}}
    @include('surat._kop')

    {{-- HEADER SURAT: NOMOR & TUJUAN --}}
    <table class="table-full" style="margin-top: 10px;">
        <tr>
            <td style="width: 55%;">
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="width: 75px;">Nomor</td>
                        <td style="width: 15px;">:</td>
                        <td>{{ $surat->nomor_surat }}</td>
                    </tr>
                    <tr>
                        <td>Lamp</td>
                        <td>:</td>
                        <td>{{ $lampiran }}</td>
                    </tr>
                    <tr>
                        <td>Hal</td>
                        <td>:</td>
                        <td class="bold">{{ $surat->perihal }}</td>
                    </tr>
                </table>
            </td>
            <td style="width: 45%; padding-left: 10px;">
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="width: 45px;">Yth.</td>
                        <td style="width: 10px;">:</td>
                        <td class="bold">Bapak / Ibu / Wali Siswa</td>
                    </tr>
                    <tr>
                        <td>Dari</td>
                        <td>:</td>
                        <td class="bold">{{ $surat->murid->nama }}</td>
                    </tr>
                    <tr>
                        <td>Kelas</td>
                        <td>:</td>
                        <td>{{ $surat->murid->kelas->nama_kelas ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding-top: 2px;">Di tempat</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ISI SURAT: PEMBUKA --}}
    <p class="content-p">
        Dengan hormat, sehubungan dengan pelanggaran tata tertib putra / putri Bapak / Ibu kami mohon kehadiran Bapak / Ibu pada :
    </p>

    {{-- TABEL JADWAL PEMANGGILAN --}}
    <table class="table-jadwal">
        <tr>
            <td style="width: 130px;">Hari, tanggal</td>
            <td style="width: 18px;">:</td>
            <td>{{ $hariTanggal }}</td>
        </tr>
        <tr>
            <td>Waktu</td>
            <td>:</td>
            <td>{{ $surat->waktu }}</td>
        </tr>
        <tr>
            <td>Tempat</td>
            <td>:</td>
            <td>{{ $surat->tempat }}</td>
        </tr>
        <tr>
            <td>Menemui</td>
            <td>:</td>
            <td><span class="bold">{{ $surat->nama_guru_menemui }}</span></td>
        </tr>
    </table>

    {{-- ISI SURAT: PENUTUP --}}
    <p class="content-p">
        Kami mengharapkan kehadiran Bapak/Ibu tepat waktu. Atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.
    </p>

    {{-- TANDA TANGAN DUA KOLOM --}}
    <table class="ttd-table">
        <tr>
            <td style="text-align: left;">
                Mengetahui,<br>
                {{ $kepsek['jabatan'] ?? 'Kepala SMK Negeri 69 Jakarta' }}
                <div style="height: 65px;"></div>
                <span class="bold underline">{{ $kepsek['nama'] ?? 'Yasma Isfa Endri' }}</span><br>
                NIP. {{ $kepsek['nip'] ?? '196711261995122001' }}
            </td>
            <td style="text-align: left; padding-left: 50px;">
                Jakarta, {{ $tanggalSuratFormat }}<br>
                {{ $wakasis['jabatan'] ?? 'Wakil kesiswaan' }}
                <div style="height: 65px;"></div>
                <span class="bold underline">{{ $wakasis['nama'] ?? 'Pesta Br Tarigan' }}</span><br>
                NIP. {{ $wakasis['nip'] ?? '198101122004122001' }}
            </td>
        </tr>
    </table>

</body>
</html>
