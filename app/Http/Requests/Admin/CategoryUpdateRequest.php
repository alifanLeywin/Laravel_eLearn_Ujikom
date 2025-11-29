<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->user()?->tenant_id && ! $this->filled('tenant_id')) {
            $this->merge(['tenant_id' => $this->user()->tenant_id]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')
                    ->where(fn ($query) => $query
                        ->where('tenant_id', $this->input('tenant_id'))
                        ->whereNull('deleted_at'))
                    ->ignore($this->route('category')?->id),
            ],
            'tenant_id' => ['required', 'uuid', 'exists:tenants,id'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
        ];
    }
}
