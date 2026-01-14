<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ActorController;
use App\Http\Controllers\DirectorController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\MaturityRatingsController;
use App\Http\Controllers\StatusController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Connection test endpoint
Route::get('/connection-test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Laravel API is connected to MySQL and ready!',
        'timestamp' => now()
    ]);
});

Route::apiResource('movies', MovieController::class);
// Routes related to movie dropdowns
Route::get('/movie-options', [MovieController::class, 'getOptions']);
Route::resource('actors', ActorController::class);
Route::resource('directors', DirectorController::class);
Route::resource('genres', GenreController::class);
Route::resource('languages', LanguageController::class);
Route::resource('ratings', MaturityRatingsController::class);
Route::resource('statuses', StatusController::class);

// Language color-specific routes
Route::get('languages/{id}/colors', [LanguageController::class, 'getColors']);
Route::put('languages/{id}/colors', [LanguageController::class, 'updateColors']);