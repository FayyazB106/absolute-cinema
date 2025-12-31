<?php

namespace App\Http\Controllers;

use App\Models\Director;

class DirectorController extends BaseController
{
    protected string $modelClass = Director::class;
    protected string $resourceName = 'Director';
}
