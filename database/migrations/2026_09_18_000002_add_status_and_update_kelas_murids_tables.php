<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('murids', function (Blueprint $table) {
            $table->string('status', 20)->default('aktif')->after('no_ortu');
            $table->foreignId('kelas_id')->nullable()->change();
            $table->foreignId('tahun_ajaran_id')->nullable()->change();
        });

        Schema::table('kelas', function (Blueprint $table) {
            $table->foreignId('tahun_ajaran_id')->nullable()->change();
        });

        Schema::table('laporans', function (Blueprint $table) {
            $table->foreignId('tahun_ajaran_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('murids', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
