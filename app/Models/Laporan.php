<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Laporan extends Model
{
    use SoftDeletes;

    /**
     * Range poin sebagai panduan visual untuk guru.
     */
    public const POIN_RANGES = [
        'pelanggaran' => [
            'ringan' => ['min' => -5,  'max' => -10],
            'sedang' => ['min' => -11, 'max' => -25],
            'berat'  => ['min' => -26, 'max' => -50],
        ],
        'prestasi' => [
            'ringan' => ['min' => 5,  'max' => 10],
            'sedang' => ['min' => 11, 'max' => 25],
            'berat'  => ['min' => 26, 'max' => 50],
        ],
        'kebaikan' => [
            'ringan' => ['min' => 5,  'max' => 10],
            'sedang' => ['min' => 11, 'max' => 25],
            'berat'  => ['min' => 26, 'max' => 50],
        ],
    ];

    protected $fillable = [
        'guru_id',
        'murid_id',
        'kategori',
        'tingkat_keparahan',
        'keterangan',
        'tanggal_kejadian',
        'keterangan_tambahan',
        'is_manual',
        'poin_diberikan',
        'status',
        'tindak_lanjut',
        'ditindaklanjuti_oleh',
        'ditindaklanjuti_at',
        'tahun_ajaran_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_kejadian'   => 'date',
            'ditindaklanjuti_at' => 'datetime',
            'poin_diberikan'     => 'integer',
            'is_manual'          => 'boolean',
        ];
    }

    /**
     * Kembalikan string hint rentang poin untuk tingkat tertentu.
     */
    public static function poinRangeHint(string $kategori, string $tingkat): string
    {
        $range = self::POIN_RANGES[$kategori][$tingkat] ?? null;
        if (!$range) {
            return '?';
        }
        return "{$range['min']} s/d {$range['max']}";
    }

    // --- Relasi ---

    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class);
    }

    public function murid(): BelongsTo
    {
        return $this->belongsTo(Murid::class);
    }

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function ditindaklanjutiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditindaklanjuti_oleh');
    }

    public function bukti(): HasMany
    {
        return $this->hasMany(BuktiLaporan::class);
    }

    // --- Scopes ---

    public function scopePelanggaran($query)
    {
        return $query->where('kategori', 'pelanggaran');
    }

    public function scopePrestasi($query)
    {
        return $query->whereIn('kategori', ['prestasi', 'kebaikan']);
    }

    public function scopeKebaikan($query)
    {
        return $this->scopePrestasi($query);
    }

    public function scopeValidPoin($query)
    {
        return $query->where(function ($q) {
            $q->where('is_manual', false)
              ->orWhere(function ($sq) {
                  $sq->where('is_manual', true)
                     ->whereNotIn('status', ['menunggu verifikasi', 'ditolak']);
              });
        });
    }

    public function scopeMenungguVerifikasi($query)
    {
        return $query->where('status', 'menunggu verifikasi');
    }

    public function scopeBaruDilaporkan($query)
    {
        return $query->where('status', 'baru dilaporkan');
    }

    public function scopePembinaan($query)
    {
        return $query->where('status', 'pembinaan tindak lanjut');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }

    public function scopeDitolak($query)
    {
        return $query->where('status', 'ditolak');
    }

    // Legacy scope aliases
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'menunggu verifikasi', 'baru dilaporkan']);
    }

    public function scopeDitindaklanjuti($query)
    {
        return $query->whereIn('status', ['ditindaklanjuti', 'selesai', 'pembinaan tindak lanjut']);
    }

    // --- Helper ---

    public function isManual(): bool
    {
        return (bool) $this->is_manual;
    }

    public function needsVerification(): bool
    {
        return $this->isManual() && $this->status === 'menunggu verifikasi';
    }

    public function isPoinBerlaku(): bool
    {
        if (!$this->is_manual) {
            return $this->status !== 'ditolak';
        }
        return !in_array($this->status, ['menunggu verifikasi', 'ditolak'], true);
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'menunggu verifikasi', 'baru dilaporkan'], true);
    }

    public function isDitindaklanjuti(): bool
    {
        return in_array($this->status, ['ditindaklanjuti', 'selesai'], true);
    }

    /**
     * Guru boleh edit selama laporan masih baru dilaporkan atau menunggu verifikasi.
     */
    public function bisaDieditOlehGuru(): bool
    {
        return in_array($this->status, ['baru dilaporkan', 'menunggu verifikasi', 'pending'], true);
    }
}
