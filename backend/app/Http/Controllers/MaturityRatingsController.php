<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaturityRating;

class MaturityRatingsController extends BaseController
{
    protected string $modelClass = MaturityRating::class;
    protected string $resourceName = 'Maturity Rating';

    // Override rules to include new fields
    protected function rules(Request $request, $id = null): array
    {
        $tableName = (new $this->modelClass)->getTable();

        return [
            'maturity_rating' => "required|string|max:10|unique:{$tableName},maturity_rating" . ($id ? ",{$id}" : ""), // Simply $id prevents updating
            'name_en'         => 'nullable|string|max:255',
            'name_ar'         => 'nullable|string|max:255',
            'ranking'         => 'required|integer|min:1',
            'desc_en'         => 'nullable|string|max:255',
            'desc_ar'         => 'nullable|string|max:255',
        ];
    }

    // Override index to sort by ranking instead of name
    public function index()
    {
        try {
            $items = $this->modelClass::withCount('movies')
                ->orderBy('ranking', 'asc') // Sort from G -> PG -> R
                ->get();
            return response()->json($items);
        } catch (\Exception $e) {
            return response()->json(['error' => "Fetch failed", 'message' => $e->getMessage()], 500);
        }
    }
}
