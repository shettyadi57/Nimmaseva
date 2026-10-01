<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OfficeController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\GrievanceController;
use App\Http\Controllers\Api\SchemeController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\CounterController;

// ── Health ────────────────────────────────────────────────────────────────────
Route::get('/health', fn() => response()->json([
    'status' => 'healthy',
    'service' => 'Nimma Seva Laravel Backend',
    'timestamp' => now()->toIso8601String(),
]));

// ── Auth ──────────────────────────────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/login',            [AuthController::class, 'login']);
    Route::post('/register',         [AuthController::class, 'register']);
    Route::post('/send-email-otp',   [AuthController::class, 'sendEmailOtp'])
         ->middleware('throttle:otp');
    Route::post('/verify-email-otp', [AuthController::class, 'verifyEmailOtp'])
         ->middleware('throttle:otp');

    // Citizen phone OTP (Firebase-style)
    Route::post('/send-otp',         [AuthController::class, 'sendPhoneOtp'])
         ->middleware('throttle:otp');
    Route::post('/verify-otp',       [AuthController::class, 'verifyPhoneOtp'])
         ->middleware('throttle:otp');

    // Citizen direct login (demo / bypass mode)
    Route::post('/citizen-login',    [AuthController::class, 'citizenDirectLogin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me',     [AuthController::class, 'me']);
        Route::post('/logout',[AuthController::class, 'logout']);
    });
});

// ── Offices ───────────────────────────────────────────────────────────────────
Route::prefix('offices')->group(function () {
    Route::get('/',        [OfficeController::class, 'index']);
    Route::get('/nearby',  [OfficeController::class, 'nearby']);       // before {id}
    Route::get('/{id}',   [OfficeController::class, 'show'])->whereNumber('id');
    Route::put('/{id}/status', [OfficeController::class, 'updateStatus'])
         ->middleware(['auth:sanctum', 'role:operator|office_admin|district_admin']);
});

// ── Services ──────────────────────────────────────────────────────────────────
Route::prefix('services')->group(function () {
    Route::get('/',           [ServiceController::class, 'index']);
    Route::get('/{id}',       [ServiceController::class, 'show'])->whereNumber('id');
    Route::put('/{id}/server-status', [ServiceController::class, 'updateServerStatus'])
         ->middleware(['auth:sanctum', 'role:operator|office_admin|district_admin']);
});

// ── Bookings ──────────────────────────────────────────────────────────────────
Route::prefix('bookings')->group(function () {
    Route::post('/',                              [BookingController::class, 'store'])
         ->middleware('throttle:booking');
    Route::get('/token/{tokenNumber}',            [BookingController::class, 'showByToken']);
    Route::get('/citizen/phone/{phone}',          [BookingController::class, 'byPhone']);
    Route::get('/{id}/pdf',                       [BookingController::class, 'downloadPdf'])
         ->whereNumber('id');
    Route::post('/{id}/cancel',                   [BookingController::class, 'cancel'])
         ->whereNumber('id');
    Route::post('/{id}/acknowledge-reminder',     [BookingController::class, 'acknowledgeReminder'])
         ->whereNumber('id');

    // Operator: list all bookings
    Route::get('/', [BookingController::class, 'index'])
         ->middleware(['auth:sanctum', 'role:operator|office_admin|district_admin']);
});

// ── Queue Operations ──────────────────────────────────────────────────────────
Route::prefix('queue')->group(function () {
    Route::get('/state/{officeId}', [QueueController::class, 'state'])->whereNumber('officeId');
    Route::get('/{officeId}',       [QueueController::class, 'state'])->whereNumber('officeId');
    Route::post('/{officeId}/control', [QueueController::class, 'controlAction'])->whereNumber('officeId');

    Route::middleware(['auth:sanctum', 'role:operator|office_admin|district_admin'])->group(function () {
        Route::post('/call-next', [QueueController::class, 'callNext']);
        Route::post('/skip',      [QueueController::class, 'skip']);
        Route::post('/recall',    [QueueController::class, 'recall']);
        Route::post('/complete',  [QueueController::class, 'complete']);
        Route::post('/pause',     [QueueController::class, 'pause']);
        Route::post('/cancel',    [QueueController::class, 'cancelToken']);
        Route::post('/transfer',  [QueueController::class, 'transfer']);
    });
});

// ── Dynamic Counter Matrix & Auto-Balancing ──────────────────────────────────
Route::prefix('counters')->group(function () {
    Route::get('/{officeId}',          [CounterController::class, 'show'])->whereNumber('officeId');
    Route::post('/{officeId}/allocate', [CounterController::class, 'allocate'])->whereNumber('officeId');
    Route::post('/{officeId}/auto-balance', [CounterController::class, 'autoBalance'])->whereNumber('officeId');
});

// ── Grievances ────────────────────────────────────────────────────────────────
Route::prefix('grievances')->group(function () {
    Route::post('/',               [GrievanceController::class, 'store']);
    Route::get('/{ticketId}',      [GrievanceController::class, 'show']);

    Route::middleware(['auth:sanctum', 'role:office_admin|district_admin|auditor'])->group(function () {
        Route::get('/',              [GrievanceController::class, 'index']);
        Route::put('/{id}/status',   [GrievanceController::class, 'updateStatus'])
             ->whereNumber('id');
    });
});

// ── Schemes ───────────────────────────────────────────────────────────────────
Route::prefix('schemes')->group(function () {
    Route::get('/',      [SchemeController::class, 'index']);
    Route::post('/filter',[SchemeController::class, 'filter']);
});

// ── Analytics & Admin (protected) ────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:office_admin|district_admin|auditor'])->group(function () {
    Route::prefix('analytics')->group(function () {
        Route::get('/summary',    [AnalyticsController::class, 'summary']);
        Route::get('/export-csv', [AnalyticsController::class, 'exportCsv']);
    });

    Route::prefix('admin')->group(function () {
        Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
        Route::get('/users',      [AdminController::class, 'users']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateRole']);
    });
});

// ── Public stats (for hero section counter) ───────────────────────────────────
Route::get('/public/stats', [PublicController::class, 'stats']);
Route::post('/public/notifications/send', [PublicController::class, 'testNotification'])
     ->middleware('auth:sanctum');

// ── Ratings ───────────────────────────────────────────────────────────────────
Route::post('/bookings/{id}/rating', [BookingController::class, 'submitRating'])
     ->whereNumber('id');
