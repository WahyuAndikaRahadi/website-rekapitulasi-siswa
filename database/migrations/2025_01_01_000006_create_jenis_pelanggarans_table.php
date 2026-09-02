<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jenis_pelanggarans', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 10);             // contoh: "P01", "K01"
            $table->string('keterangan', 255);       // contoh: "Membawa rokok ke sekolah"
            $table->enum('kategori', ['pelanggaran', 'kebaikan']);
            // tingkat_keparahan hanya relevan untuk kategori pelanggaran
            $table->enum('tingkat_keparahan', ['ringan', 'sedang', 'berat'])->nullable();
            // poin disimpan sebagai integer positif; tanda + / - ditentukan oleh kategori
            // kebaikan = +poin, pelanggaran = -poin saat dihitung di skor
            $table->integer('poin')->unsigned()->default(0);
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['kode', 'tahun_ajaran_id']); // kode unik per tahun ajaran
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jenis_pelanggarans');
    }
};
