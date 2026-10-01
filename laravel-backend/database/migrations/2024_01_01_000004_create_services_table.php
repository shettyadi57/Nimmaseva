<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 30)->unique();
            $table->string('category', 100)->default('General');
            $table->decimal('fee', 8, 2)->default(0.00);
            $table->unsignedSmallInteger('avg_processing_time_mins')->default(15);
            $table->unsignedSmallInteger('daily_capacity')->default(50);
            $table->boolean('is_active')->default(true);
            $table->string('server_status', 30)->default('Active'); // Active / Maintenance / Down
            $table->json('required_documents')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
