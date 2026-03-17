<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminGuestController;
use App\Http\Controllers\Api\AdminRoomController;
use App\Http\Controllers\Api\AdminReservationController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/rooms', [RoomController::class, 'index']);

Route::middleware(['auth:sanctum', 'token.user'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{reservation}', [BookingController::class, 'show']);
    Route::patch('/bookings/{reservation}/pay', [BookingController::class, 'pay']);
    Route::patch('/bookings/{reservation}/cancel', [BookingController::class, 'cancel']);
});

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'token.admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        Route::get('/guests', [AdminGuestController::class, 'index']);
        Route::get('/guests/{user}', [AdminGuestController::class, 'show']);
        Route::get('/guests/{user}/history', [AdminGuestController::class, 'history']);

        Route::get('/rooms', [AdminRoomController::class, 'index']);
        Route::post('/rooms', [AdminRoomController::class, 'store']);
        Route::put('/rooms/{room}', [AdminRoomController::class, 'update']);
        Route::patch('/rooms/{room}/archive', [AdminRoomController::class, 'archive']);
        Route::patch('/rooms/{room}/unarchive', [AdminRoomController::class, 'unarchive']);

        Route::get('/reservations', [AdminReservationController::class, 'index']);
        Route::post('/reservations', [AdminReservationController::class, 'store']);
        Route::put('/reservations/{reservation}', [AdminReservationController::class, 'update']);
        Route::patch('/reservations/{reservation}/confirm', [AdminReservationController::class, 'confirm']);
        Route::patch('/reservations/{reservation}/cancel', [AdminReservationController::class, 'cancel']);
    });
});
