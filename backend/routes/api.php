<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/users/suggested', [UserController::class, 'suggested']);
Route::get('/countries/trending', [PostController::class, 'getTrendingCountries']);
Route::get('/search', [App\Http\Controllers\SearchController::class, 'index']);
Route::get('/users/{user}', [UserController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Posts
    Route::post('/posts', [PostController::class, 'store']);
    Route::post('/posts/{post}/vote', [PostController::class, 'vote']);

    // Users
    Route::post('/users/{user}/follow', [UserController::class, 'follow']);
    Route::post('/users/{user}/unfollow', [UserController::class, 'unfollow']);
});
