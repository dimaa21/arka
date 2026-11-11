<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:160'],
            'message' => ['required', 'string', 'max:2000'],
        ], [
            'name.required' => 'Вкажіть ім’я.',
            'email.required' => 'Вкажіть адресу.',
            'email.email' => 'Адреса виглядає неповною.',
            'message.required' => 'Напишіть повідомлення.',
        ]);

        Message::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'body' => $validated['message'],
        ]);

        return response()->json(['ok' => true], 201);
    }
}
