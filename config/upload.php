<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Batas ukuran file bukti laporan
    |--------------------------------------------------------------------------
    | Ubah nilai ini via .env (BUKTI_MAX_SIZE_KB).
    | Nilai dalam kilobyte (KB).
    */
    'bukti_max_size_kb' => (int) env('BUKTI_MAX_SIZE_KB', 2048),

    /*
    | Tipe file yang diizinkan (dipakai juga di frontend untuk hint)
    */
    'bukti_allowed_types' => env('BUKTI_ALLOWED_TYPES', 'jpg,jpeg,png'),
];
