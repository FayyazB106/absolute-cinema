<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaturityRating extends Model
{
    protected $fillable = [
        'maturity_rating',
    ];

    public function movies(): HasMany
    {
        // One maturity rating has many movies
        return $this->hasMany(Movie::class, 'maturity_id');
    }
}
