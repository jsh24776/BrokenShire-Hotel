<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    /**
     * Laravel pluralizes "feedback" as an uncountable noun, so explicitly set table name.
     *
     * @var string
     */
    protected $table = 'feedbacks';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'reservation_id',
        'rating',
        'comment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
