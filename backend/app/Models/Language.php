<?php

namespace App\Models;

class Language extends BaseModel
{
    protected $fillable = [
        'name_en',
        'name_ar',
        'code',
        'bg_color',
        'text_color',
        'ring_color',
    ];

    protected $attributes = [
        'bg_color' => '6b7280',
        'text_color' => 'ffffff',
        'ring_color' => '6b7280',
    ];
}
