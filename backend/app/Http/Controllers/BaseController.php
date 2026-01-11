<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class BaseController extends Controller
{
    // Child classes MUST define these
    protected string $modelClass;
    protected string $resourceName; // e.g., 'Actor' or 'Language'

    // Define validation rules. Child classes can override this.
    protected function rules(Request $request, $id = null): array
    {
        $tableName = (new $this->modelClass)->getTable();

        return [
            'name_en' => "required|string|max:255|unique:{$tableName},name_en," . $id,
            'name_ar' => "required|string|max:255|unique:{$tableName},name_ar," . $id,
        ];
    }

    public function index()
    {
        try {
            $items = $this->modelClass::withCount('movies')
                ->orderBy('name_en', 'asc')
                ->get();
            return response()->json($items);
        } catch (\Exception $e) {
            return response()->json(['error' => "Failed to fetch {$this->resourceName}s", 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate($this->rules($request));
            $item = $this->modelClass::create($validated);
            return response()->json(['message' => "{$this->resourceName} created successfully", 'data' => $item], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Filter errors to only include fields that were actually validated
            $errors = $e->errors();
            $filteredErrors = [];
            foreach ($errors as $field => $messages) {
                if (!empty($messages)) {
                    $filteredErrors[$field] = $messages;
                }
            }
            return response()->json(['error' => 'Validation failed', 'errors' => $filteredErrors], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $item = $this->modelClass::with('movies')->findOrFail($id);
            return response()->json($item);
        } catch (\Exception $e) {
            return response()->json(['error' => "{$this->resourceName} not found"], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $item = $this->modelClass::findOrFail($id);
            $item->update($request->validate($this->rules($request, $id)));
            return response()->json(['message' => "{$this->resourceName} updated successfully", 'data' => $item]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $item = $this->modelClass::findOrFail($id);
            if (method_exists($item, 'movies')) {
                $relation = $item->movies();

                // Check if it's a Many-to-Many relationship (BelongsToMany)
                if ($relation instanceof \Illuminate\Database\Eloquent\Relations\BelongsToMany) {
                    $relation->detach();
                }
                // Check if it's a One-to-Many relationship (HasMany)
                elseif ($relation instanceof \Illuminate\Database\Eloquent\Relations\HasMany) {
                    // Set the movie's foreign key to null so they aren't deleted
                    $foreignKey = $relation->getForeignKeyName();
                    $relation->update([$foreignKey => null]);
                }
            }

            $item->delete();
            return response()->json(['message' => "{$this->resourceName} deleted successfully"]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed', 'message' => $e->getMessage()], 500);
        }
    }
}
