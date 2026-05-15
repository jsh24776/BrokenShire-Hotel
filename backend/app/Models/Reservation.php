<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'room_number',
        'room_type',
        'check_in_date',
        'check_out_date',
        'nights',
        'amount_cents',
        'currency',
        'payment_method',
        'payment_reference',
        'paid_at',
        'payment_status',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date:Y-m-d',
            'check_out_date' => 'date:Y-m-d',
            'paid_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function feedback()
    {
        return $this->hasOne(Feedback::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Check if a room is available for the given date range
     *
     * @param  string  $roomNumber
     * @param  \Carbon\Carbon  $checkIn
     * @param  \Carbon\Carbon  $checkOut
     * @param  int|null  $excludeReservationId  Reservation ID to exclude from check (for updates)
     * @return bool
     */
    public static function isRoomAvailable($roomNumber, $checkIn, $checkOut, $excludeReservationId = null)
    {
        $query = self::query()
            ->where('room_number', $roomNumber)
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->where('check_out_date', '>', $checkIn->toDateString())
            ->where('check_in_date', '<', $checkOut->toDateString());

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return ! $query->exists();
    }

    /**
     * Get all conflicting reservations for a room and date range
     *
     * @param  string  $roomNumber
     * @param  \Carbon\Carbon  $checkIn
     * @param  \Carbon\Carbon  $checkOut
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getConflictingReservations($roomNumber, $checkIn, $checkOut)
    {
        return self::query()
            ->where('room_number', $roomNumber)
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->where('check_out_date', '>', $checkIn->toDateString())
            ->where('check_in_date', '<', $checkOut->toDateString())
            ->get();
    }
}
