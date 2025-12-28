<?php

namespace App\Http\Controllers;

use App\Models\Director;
use Illuminate\Http\Request;

class DirectorController extends Controller
{
    // 1. Get all directors (with movie count for the table)
    public function index()
    {
        try {
            $directors = Director::withCount('movies')
                ->orderBy('name_en', 'asc')
                ->get();

            return response()->json($directors);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch directors',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Get single director with their movie list
    public function show($director)
    {
        try {
            $director = Director::with('movies')->findOrFail($director);
            return response()->json($director);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Director not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Store new director
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
            ]);

            $director = Director::create($validated);

            return response()->json([
                'message' => 'Director created successfully',
                'data' => $director
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Update director
    public function update(Request $request, $director)
    {
        try {
            $director = Director::findOrFail($director);

            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
            ]);

            $director->update($validated);

            return response()->json([
                'message' => 'Director updated successfully',
                'data' => $director
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Delete director
    public function destroy($director)
    {
        try {
            $director = Director::findOrFail($director);

            // Detach from all movies first so we don't have orphan records in the pivot table
            $director->movies()->detach();
            $director->delete();

            return response()->json(['message' => 'Director deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}