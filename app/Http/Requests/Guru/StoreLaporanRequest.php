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
        $maxKB = (int) config('upload.bukti_max_size_kb', 2048);

        return [
            'murid_id'            => ['required', 'integer', 'exists:murids,id'],
            'kategori'            => ['required', 'string', 'in:pelanggaran,prestasi,kebaikan'],
            'tingkat_keparahan'   => ['nullable', 'string', 'in:ringan,sedang,berat'],
            'keterangan'          => ['required', 'string', 'max:255'],
            'is_manual'           => ['nullable', 'boolean'],
            'poin_diberikan'      => ['required', 'integer', 'not_in:0'],
            'tanggal_kejadian'    => ['required', 'date', 'before_or_equal:today'],
            'keterangan_tambahan' => ['nullable', 'string', 'max:1000'],
            'idempotency_token'   => ['nullable', 'string', 'max:100'],
            'bukti'               => ['nullable', 'array', 'max:5'],
            'bukti.*'             => [
                'file',
                'mimes:jpg,jpeg,png',
                "max:{$maxKB}",
            ],
        ];
    }

    public function messages(): array
    {
        $maxKB = (int) config('upload.bukti_max_size_kb', 2048);
        $maxLabel = $maxKB >= 1024 ? round($maxKB / 1024, 1) . ' MB' : "{$maxKB} KB";

        return [
            'murid_id.required'                => 'Murid harus dipilih.',
            'murid_id.exists'                  => 'Data murid tidak ditemukan.',
            'kategori.required'                => 'Kategori laporan harus dipilih.',
            'kategori.in'                      => 'Kategori tidak valid.',
            'tingkat_keparahan.in'             => 'Tingkat keparahan tidak valid.',
            'keterangan.required'              => 'Keterangan/jenis tindakan harus diisi.',
            'keterangan.max'                   => 'Keterangan maksimal 255 karakter.',
            'poin_diberikan.required'          => 'Poin laporan harus diisi.',
            'poin_diberikan.integer'           => 'Poin harus berupa angka bulat.',
            'poin_diberikan.not_in'            => 'Poin tidak boleh 0.',
            'tanggal_kejadian.required'        => 'Tanggal kejadian harus diisi.',
            'tanggal_kejadian.date'            => 'Format tanggal kejadian tidak valid.',
            'tanggal_kejadian.before_or_equal' => 'Tanggal kejadian tidak boleh di masa depan.',
            'keterangan_tambahan.max'          => 'Kronologi tambahan maksimal 1000 karakter.',
            'bukti.array'                      => 'Format bukti tidak valid.',
            'bukti.max'                        => 'Maksimal 5 file foto bukti.',
            'bukti.*.file'                     => 'File bukti tidak valid atau gagal diunggah.',
            'bukti.*.uploaded'                 => "Ukuran file bukti melebihi batas maksimal server ({$maxLabel}).",
            'bukti.*.mimes'                    => 'File bukti harus berformat gambar JPG, JPEG, atau PNG.',
            'bukti.*.max'                      => "Ukuran file bukti tidak boleh lebih dari {$maxLabel}.",
        ];
    }
}
