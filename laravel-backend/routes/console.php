<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('audit:verify-chain', function () {
    $this->info('Verifying audit log integrity chain...');
    $logs = \App\Models\AuditLog::orderBy('id')->get();
    $prevHash = '';
    $broken = 0;

    foreach ($logs as $log) {
        $expected = hash('sha256', $prevHash . $log->payload);
        if ($log->hash !== $expected) {
            $this->error("Chain broken at ID {$log->id}");
            $broken++;
        }
        $prevHash = $log->hash;
    }

    if ($broken === 0) {
        $this->info("Chain verified. {$logs->count()} records intact.");
    } else {
        $this->error("{$broken} records failed hash verification.");
    }
})->purpose('Verify tamper-evident audit log hash chain');
