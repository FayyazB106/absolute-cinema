<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Movie;

class MovieController extends Controller
{
    // Get all movies with relationships
    public function index()
    {
        try {
            $movies = Movie::with(['audioLanguages', 'genres', 'actors', 'directors'])
                ->orderBy('name_en', 'asc')
                ->get();

            return response()->json($movies);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch movies',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get single movie with all relationships
    public function show($id)
    {
        try {
            $movie = Movie::with([
                'genres',
                'actors',
                'directors',
                'audioLanguages',
                'subtitles',
                'maturity_ratings',
                'status'
            ])->findOrFail($id);

            return response()->json($movie);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Movie not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch movie details',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get dropdown options for the form
    public function getOptions()
    {
        try {
            return response()->json([
                'genres' => \App\Models\Genre::all(),
                'actors' => \App\Models\Actor::all(),
                'directors' => \App\Models\Director::all(),
                'languages' => \App\Models\Language::all(),
                'maturity_ratings' => \App\Models\MaturityRating::all(),
                'statuses' => \App\Models\Status::all(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch options',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Create a new movie
    public function store(Request $request)
    {
        try {
            // 1. Validate incoming data
            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
                'desc_en' => 'required|string',
                'desc_ar' => 'required|string',
                'release_date' => 'required|date',
                'duration' => 'nullable|integer|min:0',
                'maturity_id' => 'required|exists:maturity_ratings,id',
                'status_id' => 'required|exists:statuses,id',
                'imdb_url' => 'nullable|url',
                // Pivot IDs
                'genres' => 'nullable|array',
                'genres.*' => 'exists:genres,id',
                'actors' => 'nullable|array',
                'actors.*' => 'exists:actors,id',
                'directors' => 'nullable|array',
                'directors.*' => 'exists:directors,id',
                'languages' => 'nullable|array',
                'languages.*' => 'exists:languages,id',
                'subtitles' => 'nullable|array',
                'subtitles.*' => 'exists:languages,id',
                // Image related data
                'poster_url' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'featured_poster_url' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'is_featured' => 'nullable|boolean'
            ]);

            // 2. Upload files
            $posterPath = null;
            if ($request->hasFile('poster_url')) {
                // This saves the file and returns a string like "posters/abc.jpg"
                $posterPath = $request->file('poster_url')->store('posters', 'public');
            }

            $featuredPath = null;
            if ($request->hasFile('featured_poster_url')) {
                $featuredPath = $request->file('featured_poster_url')->store('featured', 'public');
            }

            // ENFORCE RULE: Can't be featured without a featured poster
            $isFeatured = $request->boolean('is_featured');
            if ($isFeatured && !$featuredPath) {
                $isFeatured = false;
            }

            // 3. Create the Movie record
            $movie = Movie::create([
                'name_en' => $validated['name_en'],
                'name_ar' => $validated['name_ar'],
                'desc_en' => $validated['desc_en'],
                'desc_ar' => $validated['desc_ar'],
                'release_date' => $validated['release_date'],
                'duration' => $validated['duration'] ?? 0,
                'maturity_id' => $validated['maturity_id'],
                'status_id' => $validated['status_id'],
                'imdb_url' => $validated['imdb_url'] ?? null,
                'poster_url' => $posterPath,
                'featured_poster_url' => $featuredPath,
                'is_featured' => $isFeatured
            ]);

            // 4. Attach Many-to-Many relationships
            if (!empty($validated['genres'])) {
                $movie->genres()->sync($validated['genres']);
            }

            if (!empty($validated['actors'])) {
                $movie->actors()->sync($validated['actors']);
            }

            if (!empty($validated['directors'])) {
                $movie->directors()->sync($validated['directors']);
            }

            if (!empty($validated['languages'])) {
                $movie->audioLanguages()->sync($validated['languages']);
            }

            if (!empty($validated['subtitles'])) {
                $movie->subtitles()->sync($validated['subtitles']);
            }

            // Load relationships before returning
            $movie->load(['genres', 'actors', 'directors', 'audioLanguages', 'subtitles']);

            return response()->json([
                'message' => 'Movie created successfully',
                'data' => $movie
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create movie',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Edit movie info
    public function update(Request $request, $id)
    {
        try {
            $movie = Movie::findOrFail($id);

            $validated = $request->validate([
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
                'desc_en' => 'required|string',
                'desc_ar' => 'required|string',
                'release_date' => 'required|date',
                'duration' => 'nullable|integer|min:0',
                'maturity_id' => 'required|exists:maturity_ratings,id',
                'status_id' => 'required|exists:statuses,id',
                'imdb_url' => 'nullable|url',
                // Pivot IDs
                'genres' => 'nullable|array',
                'genres.*' => 'exists:genres,id',
                'actors' => 'nullable|array',
                'actors.*' => 'exists:actors,id',
                'directors' => 'nullable|array',
                'directors.*' => 'exists:directors,id',
                'languages' => 'nullable|array',
                'languages.*' => 'exists:languages,id',
                'subtitles' => 'nullable|array',
                'subtitles.*' => 'exists:languages,id',
                // Image related data
                'poster_url' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'featured_poster_url' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'is_featured' => 'nullable|boolean'
            ]);

            // Handle New Poster
            if ($request->hasFile('poster_url')) {
                // Delete old file if it exists
                if ($movie->poster_url) {
                    Storage::disk('public')->delete($movie->poster_url);
                }
                $movie->poster_url = $request->file('poster_url')->store('posters', 'public');
            }

            // Handle New Featured Poster
            if ($request->hasFile('featured_poster_url')) {
                if ($movie->featured_poster_url) {
                    Storage::disk('public')->delete($movie->featured_poster_url);
                }
                $movie->featured_poster_url = $request->file('featured_poster_url')->store('featured', 'public');
            }

            // ENFORCE RULE: If trying to mark as featured but no featured poster exists
            $isFeatured = $request->boolean('is_featured');
            if ($isFeatured && !$movie->featured_poster_url) {
                $isFeatured = false;
            }

            // Update the main movie record
            $movie->update([
                'name_en' => $validated['name_en'],
                'name_ar' => $validated['name_ar'],
                'desc_en' => $validated['desc_en'],
                'desc_ar' => $validated['desc_ar'],
                'release_date' => $validated['release_date'],
                'duration' => $validated['duration'] ?? 0,
                'maturity_id' => $validated['maturity_id'],
                'status_id' => $validated['status_id'],
                'imdb_url' => $validated['imdb_url'] ?? null,
                'is_featured' => $isFeatured,
            ]);

            $movie->save();

            // Sync Many-to-Many relationships
            $movie->genres()->sync($validated['genres'] ?? []);
            $movie->actors()->sync($validated['actors'] ?? []);
            $movie->directors()->sync($validated['directors'] ?? []);
            $movie->audioLanguages()->sync($validated['languages'] ?? []);
            $movie->subtitles()->sync($validated['subtitles'] ?? []);

            return response()->json([
                'message' => 'Movie updated successfully',
                'data' => $movie->load(['genres', 'actors', 'directors', 'audioLanguages', 'subtitles'])
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    // Delete a movie
    public function destroy($id)
    {
        try {
            $movie = Movie::findOrFail($id);

            // This will automatically remove records from pivot tables 
            // if your migrations have onDelete('cascade'). 
            // If not, it's safer to detach manually first:
            $movie->genres()->detach();
            $movie->actors()->detach();
            $movie->directors()->detach();
            $movie->audioLanguages()->detach();
            $movie->subtitles()->detach();

            // Delete the files from the physical storage
            if ($movie->poster_url) {
                Storage::disk('public')->delete($movie->poster_url);
            }
            if ($movie->featured_poster_url) {
                Storage::disk('public')->delete($movie->featured_poster_url);
            }

            $movie->delete();

            return response()->json([
                'message' => 'Movie deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Delete failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
