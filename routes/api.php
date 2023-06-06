<?php

use App\Http\Controllers\DataVersionController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::post('login', [[UserController::class, 'login']]);

Route::group(['prefix' => 'forgotten-password'], function (){
    Route::post('email', [UserController::class, 'sendPasswordResetLinkEmail']);
    Route::post('reset', [UserController::class, 'resetPassword']);
});

Route::group(['middleware' => 'auth:sanctum'], function() {
    Route::post('logout', [UserController::class, 'logout']);

    Route::group(['prefix' => 'users'], function (){
        Route::post('add', [UserController::class, 'add']);
        Route::get('all-users', [UserController::class, 'all']);
        Route::group(['prefix' => 'user/{id}'], function () {
            Route::get('get', [UserController::class, 'get']);
            Route::post('delete', [UserController::class, 'delete']);
            Route::post('suspend', [UserController::class, 'suspend']);
            Route::post('activate', [UserController::class, 'activate']);
            Route::post('upload-avatar', [UserController::class, 'uploadAvatar']);
            Route::post('delete-avatar', [UserController::class, 'deleteAvatar']);
            Route::post('update-general-info', [UserController::class, 'updateGeneralInfo']);
            Route::post('update-password', [UserController::class, 'updatePassword']);
            Route::post('update-user-type', [UserController::class, 'updateUserType']);
            Route::post('update-status', [UserController::class, 'updateStatus']);
        });
    });

    Route::group(['prefix' => 'app-data'], function (){
        Route::get('{model}/get', [DataVersionController::class,'getData']);
        Route::get('{model}/version', [DataVersionController::class,'checkDataVersion']);
    });
});
