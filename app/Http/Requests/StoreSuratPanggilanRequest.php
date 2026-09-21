<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuratPanggilanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'murid_id'          => ['required', 'exists:murids,id'],
            'guru_id'           => ['nullable', 'exists:gurus,id'],
            'nama_guru_menemui' => ['required', 'string', 'max:255'],
            'panggilan_ke'      => ['nullable', 'integer', 'min:1'],
            'tanggal_panggilan' => ['required', 'date'],
            'waktu'             => ['required', 'string', 'max:100'],
            'tempat'            => ['required', 'string', 'max:255'],
            'tanggal_surat'     => ['required', 'date'],
            'keterangan_kasus'  => ['nullable', 'string', 'max:1000'],
            'kirim_wa'          => ['nullable', 'boolean'],
        ];
    }

    /**
     * Custom message validation.
     */
    public function messages(): array
    {
        return [
            'murid_id.required'          => 'Siswa harus dipilih.',
            'murid_id.exists'            => 'Siswa yang dipilih tidak valid.',
            'nama_guru_menemui.required' => 'Nama guru yang ditemui wajib diisi.',
            'tanggal_panggilan.required' => 'Tanggal pemanggilan wajib diisi.',
            'waktu.required'             => 'Waktu pemanggilan wajib diisi.',
            'tempat.required'            => 'Tempat pemanggilan wajib diisi.',
            'tanggal_surat.required'     => 'Tanggal surat wajib diisi.',
        ];
    }
}
