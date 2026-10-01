<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5174',
        'http://localhost:3000',
        'https://nimmaseva.vercel.app',
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/nimmaseva.*\.vercel\.app$/',
    ],

    'allowed_headers' => [
        'Authorization',
        'Content-Type',
        'Accept',
        'X-Requested-With',
        'Origin',
    ],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
