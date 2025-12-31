<?php

namespace App\Http\Controllers;

use App\Models\Genre;

class GenreController extends BaseController
{
    protected string $modelClass = Genre::class;
    protected string $resourceName = 'Genre';
}
