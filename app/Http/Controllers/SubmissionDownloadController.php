<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubmissionDownloadController extends Controller
{
    public function __invoke(Request $request, Submission $submission): StreamedResponse
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $courseId = $submission->assignment?->lesson?->module?->course_id;

        $isOwner = $submission->user_id === $user->id;
        $isTeacher = $user->id === optional($submission->assignment?->lesson?->module?->course)->teacher_id;
        $isAdmin = in_array($user->role, [\App\Enums\UserRole::Admin, \App\Enums\UserRole::SuperAdmin], true);

        if (! ($isOwner || $isTeacher || $isAdmin)) {
            abort(403);
        }

        $ext = pathinfo($submission->file_path ?? '', PATHINFO_EXTENSION);
        $studentName = Str::slug($submission->user?->name ?? 'student');
        $timestamp = $submission->submitted_at?->format('Ymd_His') ?? now()->format('Ymd_His');
        $filename = sprintf('assignment-%s-%s.%s', $studentName, $timestamp, $ext ?: 'file');

        return Storage::disk('public')->download($submission->file_path, $filename);
    }
}
