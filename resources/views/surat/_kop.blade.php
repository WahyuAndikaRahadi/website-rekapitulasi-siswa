@php
    $kop = config('sekolah.kop');
    $logoPath = $kop['logo_path'] ?? public_path('images/logo-sekolah.png');
    if (!file_exists($logoPath)) {
        $logoPath = public_path('logo.png');
    }
    $logoBase64 = file_exists($logoPath) ? base64_encode(file_get_contents($logoPath)) : '';
@endphp

<table style="width: 100%; border-collapse: collapse; margin-bottom: 0; padding-bottom: 0;">
    <tr>
        <td style="width: 85px; vertical-align: middle; text-align: center; padding-right: 12px;">
            @if(!empty($logoBase64))
                <img src="data:image/png;base64,{{ $logoBase64 }}" alt="Logo Sekolah" style="width: 80px; height: auto;" />
            @endif
        </td>
        <td style="text-align: center; vertical-align: middle; line-height: 1.25;">
            <div style="font-size: 13pt; font-weight: normal; margin-bottom: 2px;">
                {{ $kop['instansi_provinsi'] ?? 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA' }}
            </div>
            <div style="font-size: 13pt; font-weight: bold; margin-bottom: 2px;">
                {{ $kop['dinas'] ?? 'DINAS PENDIDIKAN' }}
            </div>
            <div style="font-size: 15pt; font-weight: bold; margin-bottom: 2px;">
                {{ $kop['nama_sekolah'] ?? 'SEKOLAH MENENGAH KEJURUAN NEGERI 69' }}
            </div>
            <div style="font-size: 12pt; font-weight: bold; margin-bottom: 2px;">
                {{ $kop['kelompok'] ?? 'KELOMPOK : TEKNOLOGI DAN REKAYASA' }}
            </div>
            <div style="font-size: 9.5pt; margin-bottom: 2px;">
                {{ $kop['alamat'] ?? 'Jl. Dr. KRT Radjiman Widyodiningrat, Rawa Badung No. 32, Cakung Jakarta Timur' }}
            </div>
            <div style="font-size: 9.5pt; margin-bottom: 2px;">
                {{ $kop['telepon'] ?? 'Telepon. (021) 22131229' }} Email : {{ $kop['email'] ?? 'smknegeri69jkt@gmail.com' }}
            </div>
            <div style="font-size: 11pt; font-weight: bold; letter-spacing: 4px; margin-top: 2px;">
                {{ $kop['kota'] ?? 'J A K A R T A' }}
            </div>
        </td>
    </tr>
</table>

<table style="width: 100%; border-collapse: collapse; margin-top: 2px; margin-bottom: 12px;">
    <tr>
        <td style="text-align: right; font-size: 9.5pt; padding-bottom: 4px;">
            Kode Pos {{ $kop['kode_pos'] ?? '13930' }}
        </td>
    </tr>
    <tr>
        <td style="border-bottom: 3px solid #000; border-top: 1px solid #000; height: 2px; padding: 0;"></td>
    </tr>
</table>
