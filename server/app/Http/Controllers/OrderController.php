<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9\s()-]{10,20}$/'],
            'city' => ['required', 'string', 'max:80'],
            'delivery' => ['required', 'in:branch,courier'],
            'address' => ['required', 'string', 'max:160'],
            'payment' => ['required', 'in:card,cod'],
            'promo' => ['nullable', 'string', 'max:32'],
            'items' => ['required', 'array', 'min:1', 'max:12'],
            'items.*.id' => ['required', 'string'],
            'items.*.size' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:5'],
        ], [
            'name.required' => 'Вкажіть ім’я.',
            'phone.required' => 'Вкажіть телефон.',
            'phone.regex' => 'Телефон виглядає неповним.',
            'city.required' => 'Вкажіть місто.',
            'address.required' => 'Вкажіть адресу або відділення.',
            'items.required' => 'Кошик порожній.',
            'items.min' => 'Кошик порожній.',
        ]);

        $lines = [];
        $subtotal = 0;

        foreach ($validated['items'] as $item) {
            $product = Product::query()->find($item['id']);
            if (! $product) {
                return response()->json(['message' => 'У кошику є пара, якої вже немає в каталозі.'], 422);
            }
            if (! $product->stock) {
                return response()->json(['message' => $product->brand.' '.$product->title.' зараз немає в наявності.'], 422);
            }
            $size = (int) $item['size'];
            if (! in_array($size, array_map('intval', $product->sizes), true)) {
                return response()->json(['message' => 'Для '.$product->title.' немає розміру '.$size.'.'], 422);
            }
            $qty = (int) $item['qty'];
            $subtotal += $product->price * $qty;
            $lines[] = [
                'product_id' => $product->id,
                'title' => $product->title,
                'brand' => $product->brand,
                'size' => $size,
                'qty' => $qty,
                'price' => $product->price,
            ];
        }

        $code = strtoupper(trim((string) ($validated['promo'] ?? '')));
        $promo = null;
        $discount = 0;

        if ($code !== '') {
            /** @var array<string, array{type: string, amount: int, min: int}> $promos */
            $promos = config('shop.promos');
            $promo = $promos[$code] ?? null;
            if (! $promo) {
                return response()->json(['message' => 'Такого промокоду немає.'], 422);
            }
            if ($subtotal < $promo['min']) {
                return response()->json(['message' => 'Промокод діє від '.$promo['min'].' ₴.'], 422);
            }
            $discount = $promo['type'] === 'percent'
                ? (int) round($subtotal * $promo['amount'] / 100)
                : min($promo['amount'], $subtotal);
        }

        $order = DB::transaction(function () use ($validated, $lines, $code, $subtotal, $discount) {
            $order = Order::query()->create([
                'number' => $this->number(),
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'city' => $validated['city'],
                'delivery' => $validated['delivery'],
                'address' => $validated['address'],
                'payment' => $validated['payment'],
                'promo' => $code !== '' ? $code : null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
            ]);
            $order->items()->createMany($lines);

            return $order;
        });

        return response()->json([
            'number' => $order->number,
            'subtotal' => $order->subtotal,
            'discount' => $order->discount,
            'total' => $order->total,
            'promo' => $order->promo,
        ], 201);
    }

    private function number(): string
    {
        do {
            $number = 'ARKA-'.random_int(1000, 9999);
        } while (Order::query()->where('number', $number)->exists());

        return $number;
    }
}
