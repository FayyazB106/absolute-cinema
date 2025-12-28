<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    // 1. Get all genres (with movie count for the table)
    public function index()
    {
        try {
            $genres = Genre::withCount('movies')
                ->orderBy('name_en', 'asc')
                ->get();

            return response()->json($genres);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch genres',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Get single genre with its movie list
    public function show($genre)
    {
        try {
            $genre = Genre::with('movies')->findOrFail($genre);
            return response()->json($genre);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Genre not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Store new genre
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
            ]);

            $genre = Genre::create($validated);

            return response()->json([
                'message' => 'Genre created successfully',
                'data' => $genre
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Update genre
    public function update(Request $request, $genre)
    {
        try {
            $genre = Genre::findOrFail($genre);

            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
            ]);

            $genre->update($validated);

            return response()->json([
                'message' => 'Genre updated successfully',
                'data' => $genre
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Delete genre
    public function destroy($genre)
    {
        try {
            $genre = Genre::findOrFail($genre);

            // Detach from all movies first so we don't have orphan records in the pivot table
            $genre->movies()->detach();
            $genre->delete();

            return response()->json(['message' => 'Genre deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}
