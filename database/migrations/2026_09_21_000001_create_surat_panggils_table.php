<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('surat_panggils', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_surat')->unique();
            $table->unsignedInteger('nomor_urut');
            $table->unsignedSmallInteger('tahun');
            $table->foreignId('murid_id')->constrained('murids')->cascadeOnDelete();
            $table->foreignId('guru_id')->nullable()->constrained('gurus')->nullOnDelete();
            $table->string('nama_guru_menemui');
            $table->unsignedTinyInteger('panggilan_ke')->default(1);
            $table->string('perihal');
            $table->date('tanggal_panggilan');
            $table->string('waktu')->default('Pukul 09.00 WIB');
            $table->string('tempat')->default('Ruang BK SMK Negeri 69 Jakarta');
            $table->date('tanggal_surat');
            $table->text('keterangan_kasus')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tahun', 'nomor_urut']);
            $table->index(['murid_id', 'panggilan_ke']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_panggils');
    }
};
