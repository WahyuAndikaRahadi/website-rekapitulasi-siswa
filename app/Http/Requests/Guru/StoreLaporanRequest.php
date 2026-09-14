<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreLaporanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isGuru();
    }

    public function rules(): array
    {
        $maxKB    = (int) config('upload.bukti_max_size_kb', 500);
        $maxKilos = $maxKB * 1024;

        return [
            'murid_id'            => ['required', 'integer', 'exists:murids,id'],
            'kategori'            => ['required', 'string', 'in:pelanggaran,prestasi,kebaikan'],
            'tingkat_keparahan'   => ['nullable', 'string', 'in:ringan,sedang,berat'],
            'keterangan'          => ['required', 'string', 'max:255'],
            'is_manual'           => ['nullable', 'boolean'],
            'poin_diberikan'      => ['required', 'integer', 'not_in:0'],
            'tanggal_kejadian'    => ['required', 'date', 'before_or_equal:today'],
            'keterangan_tambahan' => ['nullable', 'string', 'max:1000'],
            'bukti'               => ['nullable', 'array', 'max:5'],
            'bukti.*'             => [
                'file',
                'mimes:jpg,jpeg,png',
                "max:{$maxKilos}",
            ],
        ];
    }

    public function messages(): array
    {
        $maxKB = (int) config('upload.bukti_max_size_kb', 500);

        return [
            'murid_id.required'             => 'Murid harus dipilih.',
            'murid_id.exists'               => 'Murid tidak ditemukan.',
            'kategori.required'             => 'Kategori laporan harus dipilih.',
            'kategori.in'                   => 'Kategori tidak valid.',
            'tingkat_keparahan.in'          => 'Tingkat tidak valid.',
            'keterangan.required'           => 'Keterangan/jenis tindakan harus diisi.',
            'keterangan.max'                => 'Keterangan maksimal 255 karakter.',
            'poin_diberikan.required'       => 'Poin laporan harus diisi.',
            'poin_diberikan.integer'        => 'Poin harus berupa angka bulat.',
            'poin_diberikan.not_in'         => 'Poin tidak boleh 0.',
            'tanggal_kejadian.required'     => 'Tanggal kejadian harus diisi.',
            'tanggal_kejadian.before_or_equal' => 'Tanggal kejadian tidak boleh di masa depan.',
            'bukti.max'                     => 'Maksimal 5 file bukti.',
            'bukti.*.mimes'                 => 'File bukti harus berformat JPG, JPEG, atau PNG.',
            'bukti.*.max'                   => "Ukuran file bukti maksimal {$maxKB} KB.",
        ];
    }
}
