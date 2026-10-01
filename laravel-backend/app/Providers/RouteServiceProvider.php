<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Auth: 10 req/min per IP
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute((int) env('RATE_LIMIT_AUTH', 10))->by($request->ip());
        });

        // OTP: 5 req/min per IP (strict)
        RateLimiter::for('otp', function (Request $request) {
            return Limit::perMinute((int) env('RATE_LIMIT_OTP', 5))->by($request->ip());
        });

        // Booking: 30 req/min per IP
        RateLimiter::for('booking', function (Request $request) {
            return Limit::perMinute((int) env('RATE_LIMIT_BOOKING', 30))->by($request->ip());
        });

        $this->routes(function () {
            \Illuminate\Support\Facades\Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
        });
    }
}
