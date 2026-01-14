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
        Schema::table('languages', function (Blueprint $table) {
            $table->string('bg_color', 6)->default('6b7280')->after('code')->nullable();
            $table->string('text_color', 6)->default('ffffff')->after('bg_color')->nullable();
            $table->string('ring_color', 6)->default('6b7280')->after('text_color')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('languages', function (Blueprint $table) {
            $table->dropColumn(['bg_color', 'text_color', 'ring_color']);
        });
    }
};
