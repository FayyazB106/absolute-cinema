<?php

namespace App\Http\Controllers;

use App\Models\Actor;

class ActorController extends BaseController
{
    protected string $modelClass = Actor::class;
    protected string $resourceName = 'Actor';
}
