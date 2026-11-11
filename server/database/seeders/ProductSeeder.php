<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $path = dirname(base_path()).'/data/products.json';
        $products = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['id' => $product['id']],
                [
                    'title' => $product['title'],
                    'brand' => $product['brand'],
                    'price' => $product['price'],
                    'compare_at' => $product['compareAt'] ?? null,
                    'gender' => $product['gender'],
                    'category' => $product['category'],
                    'color' => $product['color'],
                    'sizes' => $product['sizes'],
                    'season' => $product['season'],
                    'badge' => $product['badge'] ?? null,
                    'stock' => $product['stock'],
                    'image' => $product['image'],
                    'blurb' => $product['blurb'],
                    'rank' => $product['rank'],
                ],
            );
        }
    }
}
