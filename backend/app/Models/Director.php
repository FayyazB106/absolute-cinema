<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Director extends Model
{
    protected $fillable = [
        'name_en',
        'name_ar',
    ];

    /**
     * Relationship: An Director can direct in many Movies.
     */
    public function movies(): BelongsToMany
    {
        // Laravel looks for director_movie table by default
        return $this->belongsToMany(Movie::class);
    }
}
