<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Status;

class StatusController extends Controller
{
    // 1. Get all statuses (with movie count for the table)
    public function index()
    {
        try {
            $statuses = Status::withCount('movies')
                ->orderBy('status', 'asc')
                ->get();

            return response()->json($statuses);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch statuses',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 2. Get single status with its movie list
    public function show($status)
    {
        try {
            $statuses = Status::with('movies')->findOrFail($status);
            return response()->json($statuses);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Status not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Store new status
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|max:100'
            ]);

            $status = Status::create($validated);

            return response()->json([
                'message' => 'Status created successfully',
                'data' => $status
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Update status
    public function update(Request $request, $status)
    {
        try {
            $status = Status::findOrFail($status);

            $validated = $request->validate([
                'status' => 'required|string|max:100'
            ]);

            $status->update($validated);

            return response()->json([
                'message' => 'Status updated successfully',
                'data' => $status
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Delete status
    public function destroy($status)
    {
        try {
            $status = Status::findOrFail($status);
            $status->delete();

            return response()->json(['message' => 'Status deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}