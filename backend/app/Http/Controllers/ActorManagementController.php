<?php

namespace App\Http\Controllers;

use App\Models\Actor;
use Illuminate\Http\Request;

class ActorManagementController extends Controller
{
    // 1. Get all actors (with movie count for the table)
    public function index()
    {
        try {
            $actors = Actor::withCount('movies')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($actors);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch actors',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Get single actor with their movie list
    public function show($id)
    {
        try {
            $actor = Actor::with('movies')->findOrFail($id);
            return response()->json($actor);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Actor not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Store new actor
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
            ]);

            $actor = Actor::create($validated);

            return response()->json([
                'message' => 'Actor created successfully',
                'data' => $actor
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Update actor
    public function update(Request $request, $id)
    {
        try {
            $actor = Actor::findOrFail($id);

            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
            ]);

            $actor->update($validated);

            return response()->json([
                'message' => 'Actor updated successfully',
                'data' => $actor
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Delete actor
    public function destroy($id)
    {
        try {
            $actor = Actor::findOrFail($id);

            // Detach from all movies first so we don't have orphan records in the pivot table
            $actor->movies()->detach();
            $actor->delete();

            return response()->json(['message' => 'Actor deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}