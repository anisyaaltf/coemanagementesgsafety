<?php

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| The first thing we will do is create a new Laravel application instance
| which serves as the "glue" for all the components of Laravel, and is
| the IoC container for the system binding all of the various parts.
|
*/

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

/*
|--------------------------------------------------------------------------
| Bind Storage Path for Vercel Serverless
|--------------------------------------------------------------------------
*/
if (isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL']) || getenv('APP_STORAGE')) {
    $storagePath = getenv('APP_STORAGE') ?: '/tmp/storage';
    $app->useStoragePath($storagePath);

    if (!is_dir('/tmp/bootstrap/cache')) {
        @mkdir('/tmp/bootstrap/cache', 0755, true);
    }

    if (!getenv('APP_PACKAGES_CACHE')) {
        $cacheMaps = [
            'APP_PACKAGES_CACHE' => '/tmp/bootstrap/cache/packages.php',
            'APP_SERVICES_CACHE' => '/tmp/bootstrap/cache/services.php',
            'APP_CONFIG_CACHE' => '/tmp/bootstrap/cache/config.php',
            'APP_ROUTES_CACHE' => '/tmp/bootstrap/cache/routes-v7.php',
            'APP_EVENTS_CACHE' => '/tmp/bootstrap/cache/events.php',
        ];
        foreach ($cacheMaps as $k => $v) {
            putenv("{$k}={$v}");
            $_ENV[$k] = $v;
            $_SERVER[$k] = $v;
        }
    }
}

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
|
| Here we bind the important interfaces into the container. The kernels
| serve the incoming requests to this application from both the web
| and CLI.
|
*/

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

return $app;