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
     * Relationship: An Actor can appear in many Movies.
     */
    public function movies(): BelongsToMany
    {
        // Laravel looks for actor_movie table by default
        return $this->belongsToMany(Movie::class);
    }
}
