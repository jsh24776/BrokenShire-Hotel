<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'reservation_id',
        'invoice_number',
        'total_cents',
        'currency',
        'payment_status',
        'payment_method',
        'payment_reference',
        'paid_at',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'issued_at' => 'datetime',
        ];
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}

