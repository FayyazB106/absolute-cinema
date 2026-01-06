<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;

class LanguageController extends BaseController
{
    protected string $modelClass = Language::class;
    protected string $resourceName = 'Language';

    protected function rules(Request $request, $id = null): array
    {
        $tableName = (new $this->modelClass)->getTable();
        
        return [
            'name_en' => "required|string|max:255|unique:{$tableName},name_en," . $id,
            'name_ar' => "required|string|max:255|unique:{$tableName},name_ar," . $id,
            'code'    => "nullable|string|max:5|unique:{$tableName},code," . $id, // Custom field for Languages
        ];
    }
}
