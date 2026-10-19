<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 255);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->time('waktu_mulai')->nullable();
            $table->time('waktu_selesai')->nullable();
            $table->string('lokasi', 255)->nullable();
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['new', 'reschedule', 'updated', 'pending', 'completed'])->default('new');
            $table->enum('priority', ['priority', 'standard'])->default('standard');
            $table->string('dibuat_oleh', 100)->nullable();
            $table->string('diperbarui_oleh', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

