<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovieManagementController;
use App\Http\Controllers\ActorManagementController;
use App\Http\Controllers\DirectorManagementController;
use App\Http\Controllers\GenreManagementController;
use App\Http\Controllers\LanguageManagementController;
use App\Http\Controllers\MaturityManagementController;
use App\Http\Controllers\StatusManagementController;

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

// Movie Management Routes
Route::get('/movie-options', [MovieManagementController::class, 'getOptions']);
Route::get('/movies', [MovieManagementController::class, 'index']);
Route::get('/movies/{id}', [MovieManagementController::class, 'show']);
Route::post('/movies', [MovieManagementController::class, 'store']);
Route::put('/movies/{id}', [MovieManagementController::class, 'update']);
Route::delete('/movies/{id}', [MovieManagementController::class, 'destroy']);

// Actor Management Routes
Route::get('/actors', [ActorManagementController::class, 'index']);
Route::post('/actors', [ActorManagementController::class, 'store']);
Route::put('/actors/{id}', [ActorManagementController::class, 'update']);
Route::delete('/actors/{id}', [ActorManagementController::class, 'destroy']);

// Director Management Routes
Route::get('/directors', [DirectorManagementController::class, 'index']);
Route::post('/directors', [DirectorManagementController::class, 'store']);
Route::put('/directors/{id}', [DirectorManagementController::class, 'update']);
Route::delete('/directors/{id}', [DirectorManagementController::class, 'destroy']);

// Genre Management Routes
Route::get('/genres', [GenreManagementController::class, 'index']);
Route::post('/genres', [GenreManagementController::class, 'store']);
Route::put('/genres/{id}', [GenreManagementController::class, 'update']);
Route::delete('/genres/{id}', [GenreManagementController::class, 'destroy']);

// Language Management Routes
Route::get('/lang', [LanguageManagementController::class, 'index']);
Route::post('/lang', [LanguageManagementController::class, 'store']);
Route::put('/lang/{id}', [LanguageManagementController::class, 'update']);
Route::delete('/lang/{id}', [LanguageManagementController::class, 'destroy']);

// Maturity Management Routes
Route::get('/maturity', [MaturityManagementController::class, 'index']);
Route::post('/maturity', [MaturityManagementController::class, 'store']);
Route::put('/maturity/{id}', [MaturityManagementController::class, 'update']);
Route::delete('/maturity/{id}', [MaturityManagementController::class, 'destroy']);

// Status Management Routes
Route::get('/status', [StatusManagementController::class, 'index']);
Route::post('/status', [StatusManagementController::class, 'store']);
Route::put('/status/{id}', [StatusManagementController::class, 'update']);
Route::delete('/status/{id}', [StatusManagementController::class, 'destroy']);