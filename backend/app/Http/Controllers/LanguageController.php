<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;

class LanguageController extends BaseController
{
    protected string $modelClass = Language::class;
    protected string $resourceName = 'Language';

    protected function rules(Request $request): array
    {
        return [
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code'    => 'nullable|string|max:5', // Custom field for Languages
        ];
    }
}
