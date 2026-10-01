<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();           // public-safe UUID
            $table->string('token_number', 20)->index();       // e.g. G-24
            $table->string('verification_code', 10);           // 6-char anti-counterfeit
            $table->string('citizen_name', 100);
            $table->string('phone_encrypted');                 // AES-256
            $table->string('phone_hash')->index();             // HMAC for lookup
            $table->string('aadhaar_last4', 4)->nullable();    // Only last 4
            $table->unsignedTinyInteger('age');
            $table->string('gender', 20);
            $table->boolean('is_priority')->default(false);
            $table->string('priority_reason', 100)->nullable();
            $table->string('booking_type', 20)->default('Online');
            $table->foreignId('office_id')->constrained('offices');
            $table->foreignId('service_id')->constrained('services');
            $table->string('booking_date', 10);               // YYYY-MM-DD
            $table->string('visit_date', 10);                 // YYYY-MM-DD
            $table->string('visit_time', 30);                 // e.g. "10:00 AM - 10:15 AM"
            $table->string('status', 30)->default('Pending')->index();
            $table->unsignedTinyInteger('counter_number')->nullable();
            $table->decimal('amount_paid', 8, 2)->default(0.00);
            $table->unsignedTinyInteger('tatkal_probability')->default(80);
            $table->string('signed_access_token', 64)->nullable()->index(); // for cancel/PDF
            $table->boolean('reminder_sent')->default(false);
            $table->boolean('acknowledged')->default(false);
            $table->unsignedTinyInteger('no_show_count')->default(0);
            // Rating
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('rating_comment')->nullable();
            $table->timestamp('rated_at')->nullable();
            // Timestamps
            $table->timestamps();
        });

        // OTP store
        Schema::create('otp_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('phone_hash')->index();
            $table->string('otp', 6);
            $table->string('context', 20)->default('login'); // login | verify
            $table->boolean('used')->default(false);
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // Email OTP store
        Schema::create('email_otp_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('otp', 6);
            $table->boolean('used')->default(false);
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_otp_tokens');
        Schema::dropIfExists('otp_tokens');
        Schema::dropIfExists('bookings');
    }
};
