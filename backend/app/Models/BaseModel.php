<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

abstract class BaseModel extends Model
{
    protected $fillable = [
        'name_en',
        'name_ar',
    ];

    /**
     * Relationship: This entity can be associated with many Movies.
     */
    public function movies(): BelongsToMany
    {
        // Automatically determine pivot table name based on model name
        return $this->belongsToMany(Movie::class);
    }
}