<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaturityRating;

class MaturityRatingsController extends Controller
{
    // 1. Get all maturity ratings (with movie count for the table)
    public function index()
    {
        try {
            $ratings = MaturityRating::withCount('movies')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($ratings);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch maturity ratings',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Get single maturity ratings with their movie list
    public function show($rating)
    {
        try {
            $rating = MaturityRating::with('movies')->findOrFail($rating);
            return response()->json($rating);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Maturity ratings not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Store new maturity rating
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'maturity_rating' => 'required|string|max:10'
            ]);

            $rating = MaturityRating::create($validated);

            return response()->json([
                'message' => 'Rating created successfully',
                'data' => $rating
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Update maturity rating
    public function update(Request $request, $rating)
    {
        try {
            $rating = MaturityRating::findOrFail($rating);

            $validated = $request->validate([
                'maturity_rating' => 'required|string|max:10'
            ]);

            $rating->update($validated);

            return response()->json([
                'message' => 'Maturity rating updated successfully',
                'data' => $rating
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Delete maturity rating
    public function destroy($rating)
    {
        try {
            $rating = MaturityRating::findOrFail($rating);
            $rating->delete();

            return response()->json(['message' => 'Maturity rating deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}
