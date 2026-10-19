<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reminder_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('pic_id')->nullable()->constrained('pics')->nullOnDelete();
            $table->string('recipient_email', 255);
            $table->string('recipient_name', 255)->nullable();
            $table->string('reminder_type', 50); // 'H-7', 'H-3', 'H-1', 'Hari H', 'H-1 Jam'
            $table->string('status', 50)->default('sent'); // 'sent', 'failed'
            $table->text('error_message')->nullable();
            $table->date('sent_date');
            $table->timestamp('sent_at');
            $table->timestamps();

            $table->index(['event_id', 'reminder_type', 'sent_date']);
            $table->index(['recipient_email', 'sent_date']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reminder_logs');
    }
};
