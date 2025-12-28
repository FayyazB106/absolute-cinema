<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Maturity;

class MaturityManagementController extends Controller
{
    // 1. Get all maturities (with movie count for the table)
    public function index()
    {
        try {
            $maturities = Maturity::withCount('movies')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($maturities);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch maturities',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Get single maturity with their movie list
    public function show($id)
    {
        try {
            $maturity = Maturity::with('movies')->findOrFail($id);
            return response()->json($maturity);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Language not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Store new maturity
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'maturity' => 'required|string|max:10'
            ]);

            $maturity = Maturity::create($validated);

            return response()->json([
                'message' => 'Maturity created successfully',
                'data' => $maturity
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Update maturity
    public function update(Request $request, $id)
    {
        try {
            $maturity = Maturity::findOrFail($id);

            $validated = $request->validate([
                'maturity' => 'required|string|max:10'
            ]);

            $maturity->update($validated);

            return response()->json([
                'message' => 'Language updated successfully',
                'data' => $maturity
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Delete maturity
    public function destroy($id)
    {
        try {
            $maturity = Maturity::findOrFail($id);
            $maturity->delete();

            return response()->json(['message' => 'Language deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}
