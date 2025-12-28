<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Movie extends Model
{
    protected $fillable = [
        'name_en',
        'name_ar',
        'desc_en',
        'desc_ar',
        'release_date',
        'imdb_url',
        'duration',
        'maturity_id',
        'status_id'
    ];

    // Ensure these are all PUBLIC
    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    public function actors(): BelongsToMany
    {
        return $this->belongsToMany(Actor::class);
    }

    public function directors(): BelongsToMany
    {
        return $this->belongsToMany(Director::class);
    }

    public function audioLanguages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'language_movie');
    }

    public function subtitles(): BelongsToMany
    {
        // We specify the table and foreign keys because it reuses the Language model
        return $this->belongsToMany(Language::class, 'movie_subtitle', 'movie_id', 'language_id');
    }

    public function maturity(): BelongsTo
    {
        return $this->belongsTo(Maturity::class, 'maturity_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }
}
