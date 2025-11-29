<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourseUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'tenant_id' => ['nullable', 'uuid', 'exists:tenants,id'],
            'teacher_id' => ['nullable', 'uuid', 'exists:users,id'],
            'category_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'status' => ['required', 'string', 'in:draft,published'],
            'level' => ['nullable', 'string', 'max:100'],
        ];
    }
}
