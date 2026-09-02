<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('murid_id')->constrained('murids')->cascadeOnDelete();
            $table->foreignId('jenis_pelanggaran_id')->constrained('jenis_pelanggarans')->cascadeOnDelete();
            $table->date('tanggal_kejadian');
            $table->text('keterangan_tambahan')->nullable();
            // snapshot poin saat laporan dibuat — histori tidak berubah walau master data direvisi
            $table->integer('poin_diberikan');
            $table->enum('status', ['pending', 'ditindaklanjuti', 'ditolak'])->default('pending');
            $table->text('tindak_lanjut')->nullable();
            // admin yang menindaklanjuti
            $table->foreignId('ditindaklanjuti_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('ditindaklanjuti_at')->nullable();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes(); // audit trail — jangan hard delete
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporans');
    }
};
