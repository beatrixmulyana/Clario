<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SimplifyController;

Route::post('/simplify', [SimplifyController::class, 'simplify']);