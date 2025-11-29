<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthorizeResource
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $ability = 'view'): Response
    {
        $route = $request->route();

        foreach ($route?->parameters() ?? [] as $parameter) {
            if (is_object($parameter) && method_exists($parameter, 'getTable')) {
                $request->user()?->can($ability, $parameter) ?: abort(403);
            }
        }

        return $next($request);
    }
}
