<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Status extends Model
{
    protected $fillable = [
        'status',
    ];

    public function movies(): HasMany
    {
        // One status rating has many movies
        return $this->hasMany(Movie::class, 'status_id');
    }
}
