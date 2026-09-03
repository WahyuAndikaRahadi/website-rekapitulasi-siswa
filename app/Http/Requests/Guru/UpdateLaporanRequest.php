<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLaporanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $laporan = $this->route('laporan');
        $guru    = $this->user()->guru;

        // Hanya guru pemilik laporan, dan hanya selama masih pending
        return $guru && $laporan->guru_id === $guru->id && $laporan->isPending();
    }

    public function rules(): array
    {
        $maxKB    = (int) config('upload.bukti_max_size_kb', 500);
        $maxKilos = $maxKB * 1024;

        return [
            'murid_id'            => ['required', 'integer', 'exists:murids,id'],
            'kategori'            => ['required', 'string', 'in:pelanggaran,kebaikan'],
            'tingkat_keparahan'   => ['required', 'string', 'in:ringan,sedang,berat'],
            'keterangan'          => ['required', 'string', 'max:255'],
            'tanggal_kejadian'    => ['required', 'date', 'before_or_equal:today'],
            'keterangan_tambahan' => ['nullable', 'string', 'max:1000'],
            'bukti_hapus'         => ['nullable', 'array'],
            'bukti_hapus.*'       => ['integer', 'exists:bukti_laporans,id'],
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
            'kategori.required'             => 'Kategori laporan harus dipilih.',
            'tingkat_keparahan.required'    => 'Tingkat keparahan / kebaikan harus dipilih.',
            'keterangan.required'           => 'Keterangan/jenis tindakan harus diisi.',
            'tanggal_kejadian.required'     => 'Tanggal kejadian harus diisi.',
            'tanggal_kejadian.before_or_equal' => 'Tanggal kejadian tidak boleh di masa depan.',
            'bukti.*.mimes'                 => 'File bukti harus berformat JPG, JPEG, atau PNG.',
            'bukti.*.max'                   => "Ukuran file bukti maksimal {$maxKB} KB.",
        ];
    }
}
