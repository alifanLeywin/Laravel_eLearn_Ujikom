<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $search = (string) $request->input('search', '');

        $courses = Course::query()
            ->where('status', 'published')
            ->with(['teacher:id,name', 'category:id,name'])
            ->select(['id', 'title', 'slug', 'status', 'description', 'level', 'teacher_id', 'category_id', 'cover_image'])
            ->when(filled($search), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('title', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'status' => $course->status,
                'description' => $course->description,
                'level' => $course->level,
                'cover_image' => $course->cover_image,
                'teacher' => $course->teacher?->name,
                'category' => $course->category?->name,
            ]);

        $categories = Category::query()
            ->whereNull('parent_id')
            ->limit(8)
            ->get(['id', 'name'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]);

        return Inertia::render('public/home', [
            'courses' => $courses,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }
}
