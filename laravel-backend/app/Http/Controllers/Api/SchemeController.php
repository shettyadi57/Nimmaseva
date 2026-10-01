<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scheme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchemeController extends Controller
{
    // ── GET /api/schemes ──────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        return response()->json(Scheme::orderBy('category')->orderBy('title')->get()->map(fn($s) => $this->format($s)));
    }

    // ── POST /api/schemes/filter ──────────────────────────────────────────────
    public function filter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'age'        => 'nullable|integer|min:1|max:120',
            'gender'     => 'nullable|string|max:20',
            'income'     => 'nullable|numeric|min:0',
            'occupation' => 'nullable|string|max:100',
            'category'   => 'nullable|string|max:100',
            'district'   => 'nullable|string|max:100',
        ]);

        $q = Scheme::query();

        if (isset($data['age'])) {
            $q->where('min_age', '<=', $data['age'])->where('max_age', '>=', $data['age']);
        }
        if (! empty($data['gender']) && $data['gender'] !== 'All') {
            $q->where(fn($sq) => $sq->where('gender_eligibility', $data['gender'])->orWhere('gender_eligibility', 'All'));
        }
        if (isset($data['income'])) {
            $q->where(fn($sq) => $sq->where('max_income', '=', 0)->orWhere('max_income', '>=', $data['income']));
        }
        if (! empty($data['occupation']) && $data['occupation'] !== 'All') {
            $q->where(fn($sq) => $sq->where('target_occupation', $data['occupation'])->orWhere('target_occupation', 'All'));
        }
        if (! empty($data['category']) && $data['category'] !== 'All') {
            $q->where('category', $data['category']);
        }

        return response()->json($q->get()->map(fn($s) => $this->format($s)));
    }

    private function format(Scheme $s): array
    {
        return [
            'id'                  => $s->id,
            'title'               => $s->title,
            'category'            => $s->category,
            'min_age'             => $s->min_age,
            'max_age'             => $s->max_age,
            'gender_eligibility'  => $s->gender_eligibility,
            'max_income'          => $s->max_income,
            'target_occupation'   => $s->target_occupation,
            'district'            => $s->district,
            'description'         => $s->description,
            'required_documents'  => $s->required_documents ?? [],
            'benefits'            => $s->benefits,
            'apply_link'          => $s->apply_link,
        ];
    }
}
