<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MovieRequest extends FormRequest
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
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'desc_en' => 'required|string',
            'desc_ar' => 'required|string',
            'release_date' => 'required|date',
            'duration' => 'nullable|integer|min:0',
            'maturity_id' => 'required|exists:maturity_ratings,id',
            'status_id' => 'required|exists:statuses,id',
            'is_featured' => 'boolean',
            'imdb_url' => [
                'nullable',
                'url',
                'regex:/^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/i'
            ],

            // Validation for Arrays (IDs must exist in your tables)
            'genres' => 'nullable|array',
            'genres.*' => 'exists:genres,id',
            'actors' => 'nullable|array',
            'actors.*' => 'exists:actors,id',
            'directors' => 'nullable|array',
            'directors.*' => 'exists:directors,id',
            'languages' => 'required|array|min:1',
            'languages.*' => 'exists:languages,id',
            'subtitles' => 'nullable|array',
            'subtitles.*' => 'exists:languages,id',

            // Image Validation
            'poster_url' => [
                $this->isMethod('post') ? 'required' : 'nullable',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048', // 2MB
                'dimensions:width=1000,min_height=1400,max_height=1600'
            ],
            'featured_poster_url' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048',
                'dimensions:width=1920,height=1080'
            ],
        ];
    }
}
