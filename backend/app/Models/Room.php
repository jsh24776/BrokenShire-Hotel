<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'room_number',
        'display_name',
        'type',
        'floor',
        'capacity',
        'size',
        'description',
        'image_url',
        'base_rate_cents',
        'currency',
        'status',
        'housekeeping_status',
        'amenities',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'archived_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'room_number';
    }
}
