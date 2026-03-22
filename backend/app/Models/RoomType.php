<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'capacity',
        'base_rate_cents',
        'currency',
        'amenities',
        'description',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
        ];
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}

