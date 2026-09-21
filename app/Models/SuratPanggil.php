<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratPanggil extends Model
{
    protected $table = 'surat_panggils';

    protected $fillable = [
        'nomor_surat',
        'nomor_urut',
        'tahun',
        'murid_id',
        'guru_id',
        'nama_guru_menemui',
        'panggilan_ke',
        'perihal',
        'tanggal_panggilan',
        'waktu',
        'tempat',
        'tanggal_surat',
        'keterangan_kasus',
        'created_by',
    ];

    protected $casts = [
        'tanggal_panggilan' => 'date:Y-m-d',
        'tanggal_surat'     => 'date:Y-m-d',
        'panggilan_ke'      => 'integer',
        'nomor_urut'        => 'integer',
        'tahun'             => 'integer',
    ];

    // --- Relasi ---

    public function murid(): BelongsTo
    {
        return $this->belongsTo(Murid::class);
    }

    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
