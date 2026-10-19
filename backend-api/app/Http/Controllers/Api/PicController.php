<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pic;
use Illuminate\Http\Request;

class PicController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pics = Pic::withCount('events')->orderBy('created_at', 'desc')->get();
        return response()->json($pics);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'no_telp' => 'nullable|string|max:20',
            'status' => 'nullable|string',
        ]);

        $pic = Pic::create($validated);

        return response()->json($pic, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $pic = Pic::with('events')->findOrFail($id);
        return response()->json($pic);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $pic = Pic::findOrFail($id);
        $pic->update($request->all());

        return response()->json($pic);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pic = Pic::findOrFail($id);
        $pic->delete();

        return response()->json(['message' => 'PIC deleted successfully']);
    }
}
