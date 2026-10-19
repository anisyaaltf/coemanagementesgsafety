<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\PicController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReminderController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::apiResource('events', EventController::class);
Route::apiResource('pics', PicController::class);

// Automation & Reminder Endpoints
Route::match(['get', 'post'], '/cron/send-reminders', [ReminderController::class, 'handleCron']);
Route::get('/reminders/logs', [ReminderController::class, 'logs']);
Route::post('/reminders/trigger', [ReminderController::class, 'trigger']);


