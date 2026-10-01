<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scheme extends Model
{
    protected $fillable = [
        'title', 'category', 'min_age', 'max_age',
        'gender_eligibility', 'max_income', 'target_occupation',
        'district', 'description', 'required_documents', 'benefits', 'apply_link',
    ];

    protected function casts(): array
    {
        return [
            'required_documents' => 'array',
            'max_income'         => 'float',
        ];
    }
}
