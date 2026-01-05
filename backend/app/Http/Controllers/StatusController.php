<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Status;

class StatusController extends BaseController
{
    protected string $modelClass = Status::class;
    protected string $resourceName = 'Status';
}