<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminGuestController;
use App\Http\Controllers\Api\AdminRoomController;
use App\Http\Controllers\Api\AdminReservationController;
use App\Http\Controllers\Api\AdminFeedbackController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/rooms', [RoomController::class, 'index']);

Route::middleware(['auth:sanctum', 'token.user'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::patch('/profile/password', [AuthController::class, 'updatePassword']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{reservation}', [BookingController::class, 'show']);
    Route::patch('/bookings/{reservation}/pay', [BookingController::class, 'pay']);
    Route::patch('/bookings/{reservation}/cancel', [BookingController::class, 'cancel']);

    Route::get('/feedbacks', [FeedbackController::class, 'index']);
    Route::post('/feedbacks', [FeedbackController::class, 'store']);

    Route::post('/chat', [ChatController::class, 'chat'])->middleware('throttle:30,1');
});

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AdminAuthController::class, 'resetPassword']);

    Route::middleware(['auth:sanctum', 'token.admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        Route::get('/guests', [AdminGuestController::class, 'index']);
        Route::post('/guests', [AdminGuestController::class, 'store']);
        Route::get('/guests/{user}', [AdminGuestController::class, 'show']);
        Route::get('/guests/{user}/history', [AdminGuestController::class, 'history']);

        Route::get('/rooms', [AdminRoomController::class, 'index']);
        Route::get('/rooms/availability', [AdminRoomController::class, 'availability']);
        Route::get('/rooms/availability-calendar', [AdminRoomController::class, 'availabilityCalendar']);
        Route::post('/rooms', [AdminRoomController::class, 'store']);
        Route::put('/rooms/{room}', [AdminRoomController::class, 'update']);
        Route::patch('/rooms/{room}/archive', [AdminRoomController::class, 'archive']);
        Route::patch('/rooms/{room}/unarchive', [AdminRoomController::class, 'unarchive']);

        Route::get('/reservations', [AdminReservationController::class, 'index']);
        Route::post('/reservations', [AdminReservationController::class, 'store']);
        Route::put('/reservations/{reservation}', [AdminReservationController::class, 'update']);
        Route::patch('/reservations/{reservation}/check-in', [AdminReservationController::class, 'checkIn']);
        Route::patch('/reservations/{reservation}/record-payment', [AdminReservationController::class, 'recordPayment']);
        Route::patch('/reservations/{reservation}/refund', [AdminReservationController::class, 'refund']);
        Route::patch('/reservations/{reservation}/confirm', [AdminReservationController::class, 'confirm']);
        Route::patch('/reservations/{reservation}/cancel', [AdminReservationController::class, 'cancel']);

        Route::get('/feedbacks', [AdminFeedbackController::class, 'index']);
    });
});
