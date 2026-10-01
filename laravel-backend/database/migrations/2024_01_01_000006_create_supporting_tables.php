<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('queue_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('office_id')->unique()->constrained('offices');
            $table->string('current_token', 20)->nullable();
            $table->string('next_token', 20)->nullable();
            $table->unsignedTinyInteger('active_counters')->default(3);
            $table->boolean('is_paused')->default(false);
            $table->json('counter_allocations')->nullable(); // dynamic counter matrix
            $table->timestamps();
        });

        Schema::create('grievances', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_id', 20)->unique()->index(); // GRV-XXXXXX
            $table->string('citizen_name', 100);
            $table->string('mobile', 15);
            $table->string('token_number', 20)->nullable();
            $table->string('center_name', 150);
            $table->string('category', 100);
            $table->text('description');
            $table->string('status', 30)->default('Submitted');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_name', 150);
            $table->string('action', 50);
            $table->text('details')->nullable();
            $table->text('payload');                    // full JSON for hashing
            $table->string('hash', 64);                 // sha256(prev_hash + payload)
            $table->timestamp('timestamp')->useCurrent();
            $table->timestamps();
        });

        Schema::create('schemes', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('category', 100);
            $table->unsignedTinyInteger('min_age')->default(0);
            $table->unsignedTinyInteger('max_age')->default(100);
            $table->string('gender_eligibility', 20)->default('All');
            $table->decimal('max_income', 10, 2)->default(0);
            $table->string('target_occupation', 100)->default('All');
            $table->string('district', 100)->default('Shivamogga');
            $table->text('description');
            $table->json('required_documents')->nullable();
            $table->text('benefits');
            $table->string('apply_link', 500)->nullable();
            $table->timestamps();
        });

        // Personal access tokens (Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('schemes');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('grievances');
        Schema::dropIfExists('queue_states');
    }
};
