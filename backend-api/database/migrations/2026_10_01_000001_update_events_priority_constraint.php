<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            // Update any legacy priorities to new values
            DB::statement("UPDATE events SET priority = 'priority' WHERE priority = 'high'");
            DB::statement("UPDATE events SET priority = 'standard' WHERE priority IN ('medium', 'low') OR priority IS NULL");

            // Drop existing constraint if it exists
            DB::statement("ALTER TABLE events DROP CONSTRAINT IF EXISTS events_priority_check");

            // Update default column value to 'standard'
            DB::statement("ALTER TABLE events ALTER COLUMN priority SET DEFAULT 'standard'");

            // Add updated check constraint accepting 'priority' and 'standard'
            DB::statement("ALTER TABLE events ADD CONSTRAINT events_priority_check CHECK (priority IN ('priority', 'standard'))");
        } elseif ($driver === 'mysql') {
            DB::statement("UPDATE events SET priority = 'priority' WHERE priority = 'high'");
            DB::statement("UPDATE events SET priority = 'standard' WHERE priority IN ('medium', 'low') OR priority IS NULL");
            DB::statement("ALTER TABLE events MODIFY COLUMN priority ENUM('priority', 'standard') DEFAULT 'standard'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE events DROP CONSTRAINT IF EXISTS events_priority_check");
            DB::statement("ALTER TABLE events ALTER COLUMN priority SET DEFAULT 'high'");
            DB::statement("ALTER TABLE events ADD CONSTRAINT events_priority_check CHECK (priority IN ('high', 'medium', 'low'))");
        } elseif ($driver === 'mysql') {
            DB::statement("ALTER TABLE events MODIFY COLUMN priority ENUM('high', 'medium', 'low') DEFAULT 'high'");
        }
    }
};
