<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->orderBy('rank')
            ->get()
            ->map(fn (Product $product) => $product->toCatalog())
            ->values();

        return response()->json(['products' => $products]);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['product' => $product->toCatalog()]);
    }
}
