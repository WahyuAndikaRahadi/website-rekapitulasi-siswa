<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class BuktiLaporan extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'laporan_id',
        'path_file',
        'nama_asli',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
        ];
    }

    // --- Relasi ---

    public function laporan(): BelongsTo
    {
        return $this->belongsTo(Laporan::class);
    }

    // --- Helper ---

    /**
     * URL publik file bukti.
     * Jika nanti pindah ke S3-compatible, cukup ganti disk di sini — tidak perlu refactor lain.
     */
    public function url(): string
    {
        return Storage::disk('public')->url($this->path_file);
    }
}
