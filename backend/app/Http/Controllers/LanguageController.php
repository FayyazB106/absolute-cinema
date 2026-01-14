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
            'code'    => "nullable|string|max:5|unique:{$tableName},code," . $id, // en, ar, fr etc
            'bg_color' => 'nullable|string|max:6',
            'text_color' => 'nullable|string|max:6',
            'ring_color' => 'nullable|string|max:6',
        ];
    }

    public function getColors($id)
    {
        try {
            $item = $this->modelClass::with('movies')->findOrFail($id);
            return response()->json($item);
        } catch (\Exception $e) {
            return response()->json(['error' => "{$this->resourceName} not found"], 404);
        }
    }

    public function updateColors(Request $request, $id)
    {
        try {
            $item = $this->modelClass::findOrFail($id);
            // Use 'sometimes' or just validate the fields present in the request to avoid "name_en is required" errors when only saving colors.
            $rules = $this->rules($request, $id);

            // Convert 'required' to 'sometimes' for color-only updates
            foreach ($rules as $key => $rule) {
                if (is_string($rule)) {
                    $rules[$key] = str_replace('required', 'sometimes', $rule);
                }
            }

            $validatedData = $request->validate($rules);
            $item->update($validatedData);
            return response()->json(['message' => "{$this->resourceName} colors updated", 'data' => $item]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }
}
