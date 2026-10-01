<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email')->unique()->nullable();
            $table->string('phone_encrypted')->nullable();   // AES-256 encrypted at rest
            $table->string('phone_hash')->nullable()->index(); // HMAC for lookup
            $table->string('password')->nullable();
            $table->string('aadhaar_last4', 4)->nullable();  // store last 4 only
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('taluk', 100)->nullable();
            $table->string('village_or_address', 300)->nullable();
            $table->string('employee_id', 30)->nullable();
            $table->string('department', 100)->nullable();
            $table->unsignedInteger('office_id')->nullable();
            $table->boolean('must_change_password')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
