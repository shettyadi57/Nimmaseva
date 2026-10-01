<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('offices', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('type', 50);            // GramOne / SevaSindhu / BSK
            $table->string('address', 300);
            $table->string('district', 100)->default('Shivamogga');
            $table->string('taluk', 100)->index();
            $table->string('village', 100)->nullable();
            $table->decimal('latitude', 10, 6);
            $table->decimal('longitude', 11, 6);
            $table->string('phone', 20);
            $table->string('working_hours', 50)->default('09:00 AM - 05:00 PM');
            $table->string('lunch_break', 50)->default('01:00 PM - 02:00 PM');
            $table->unsignedSmallInteger('max_daily_tokens')->default(100);
            $table->string('server_status', 30)->default('Active');
            // Hybrid token ranges (JSON arrays or string like "01-10,41-50")
            $table->string('offline_range', 50)->default('01-10,41-50');
            $table->string('online_range', 50)->default('11-40,51-80');
            $table->string('priority_range', 50)->default('81-90');
            $table->string('emergency_range', 50)->default('91-100');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offices');
    }
};
