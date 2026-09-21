<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Kop Surat & Identitas Sekolah
    |--------------------------------------------------------------------------
    */
    'kop' => [
        'instansi_provinsi' => 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA',
        'dinas'             => 'DINAS PENDIDIKAN',
        'nama_sekolah'      => 'SEKOLAH MENENGAH KEJURUAN NEGERI 69',
        'kelompok'          => 'KELOMPOK : TEKNOLOGI DAN REKAYASA',
        'alamat'            => 'Jl. Dr. KRT Radjiman Widyodiningrat, Rawa Badung No. 32, Cakung Jakarta Timur',
        'telepon'           => 'Telepon. (021) 22131229',
        'email'             => 'smknegeri69jkt@gmail.com',
        'kota'              => 'J A K A R T A',
        'kode_pos'          => '13930',
        'logo_path'         => public_path('images/logo-sekolah.png'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Pejabat Sekolah Penandatangan Surat
    |--------------------------------------------------------------------------
    */
    'pejabat' => [
        'kepala_sekolah' => [
            'jabatan' => 'Kepala SMK Negeri 69 Jakarta',
            'nama'    => env('KEPSEK_NAMA', 'Drs. Kiagus Abdurachman'),
            'nip'     => env('KEPSEK_NIP', '196805121994121002'),
        ],
        'wakil_kesiswaan' => [
            'jabatan' => 'Wakil Kesiswaan',
            'nama'    => env('WAKASIS_NAMA', 'Wakil Kesiswaan SMKN 69'),
            'nip'     => env('WAKASIS_NIP', '197501012000031001'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Settings Surat Panggilan
    |--------------------------------------------------------------------------
    */
    'surat_panggilan' => [
        'tempat_default' => 'Ruang BK SMK Negeri 69 Jakarta',
        'waktu_default'  => 'Pukul 09.00 WIB',
        'lampiran'       => '-',
        'kode_klasifikasi' => 'PK.01.04',
    ],
];
