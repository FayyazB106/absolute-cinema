<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;

class LanguageController extends Controller
{
    // 1. Get all languages (with movie count for the table)
    public function index()
    {
        try {
            $languages = Language::withCount('movies')
                ->orderBy('name_en', 'asc')
                ->get();

            return response()->json($languages);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch languages',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Get single language with their movie list
    public function show($language)
    {
        try {
            $language = Language::with('movies')->findOrFail($language);
            return response()->json($language);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Language not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Store new language
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
                'code'    => 'nullable|string|max:5',
            ]);

            $language = Language::create($validated);

            return response()->json([
                'message' => 'Language created successfully',
                'data' => $language
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Update language
    public function update(Request $request, $language)
    {
        try {
            $language = Language::findOrFail($language);

            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
            ]);

            $language->update($validated);

            return response()->json([
                'message' => 'Language updated successfully',
                'data' => $language
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Delete language
    public function destroy($language)
    {
        try {
            $language = Language::findOrFail($language);

            // Detach from all movies first so we don't have orphan records in the pivot table
            $language->movies()->detach();
            $language->delete();

            return response()->json(['message' => 'Language deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}