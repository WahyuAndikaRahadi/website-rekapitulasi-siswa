<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            $table->string('no_telp', 20)->nullable()->after('nama');
        });

        Schema::table('murids', function (Blueprint $table) {
            $table->string('no_telp', 20)->nullable()->after('nisn');
        });
    }

    public function down(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            $table->dropColumn('no_telp');
        });

        Schema::table('murids', function (Blueprint $table) {
            $table->dropColumn('no_telp');
        });
    }
};
