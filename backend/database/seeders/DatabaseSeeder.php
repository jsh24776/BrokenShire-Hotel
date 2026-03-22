<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admins are created manually (or via seed) so they can log in to the Admin Portal.
        Admin::updateOrCreate(
            ['email' => 'admin@brokenshire.com'],
            [
                'name' => 'Admin',
                'role' => 'admin',
                'password' => Hash::make('secret123'),
            ]
        );

        // Rooms: keep the app consistent with the landing page (3 featured rooms).
        $this->call([
            RoomSeeder::class,
        ]);

        // Guests (users) should be created through the /api/register endpoint.
        // Do NOT seed guests here for production-like behavior.
    }
}
