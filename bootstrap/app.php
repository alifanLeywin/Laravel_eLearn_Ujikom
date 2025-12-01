<?php

use App\Http\Middleware\AuthorizeResource;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'can.resource' => AuthorizeResource::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (NotFoundHttpException $exception, $request) {
            if ($request->expectsJson()) {
                return null;
            }

            return Inertia::render('errors/not-found')
                ->toResponse($request)
                ->setStatusCode(404);
        });

        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $exception, $request) {
            if ($request->expectsJson()) {
                return null;
            }

            return Inertia::render('errors/forbidden', [
                'message' => $exception->getMessage() ?: 'Anda tidak memiliki izin untuk akses.',
            ])
                ->toResponse($request)
                ->setStatusCode(403);
        });

        $exceptions->render(function (HttpException $exception, $request) {
            if ($exception->getStatusCode() !== 403 || $request->expectsJson()) {
                return null;
            }

            return Inertia::render('errors/forbidden', [
                'message' => $exception->getMessage() ?: 'Anda tidak memiliki izin untuk akses.',
            ])
                ->toResponse($request)
                ->setStatusCode(403);
        });
    })->create();
