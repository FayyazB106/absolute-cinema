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
        Schema::table('maturity_ratings', function (Blueprint $table) {
            $table->string('name_en')->after('maturity_rating')->nullable();
            $table->text('desc_en')->after('name_en')->nullable();
            $table->string('name_ar')->after('desc_en')->nullable();        
            $table->text('desc_ar')->after('name_ar')->nullable();
            $table->integer('ranking')->after('desc_ar')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maturity_ratings', function (Blueprint $table) {
            $table->dropColumn(['name_en', 'desc_en', 'name_ar', 'desc_ar', 'ranking']);
        });
    }
};
