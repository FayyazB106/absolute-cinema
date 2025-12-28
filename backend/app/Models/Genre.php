<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Genre extends Model
{
    protected $fillable = [
        'name_en',
        'name_ar',
    ];

    /**
     * Relationship: An Genre can define in many Movies.
     */
    public function movies(): BelongsToMany
    {
        // Laravel looks for genre_movie table by default
        return $this->belongsToMany(Movie::class);
    }
}
