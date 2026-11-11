<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id',
    'title',
    'brand',
    'price',
    'compare_at',
    'gender',
    'category',
    'color',
    'sizes',
    'season',
    'badge',
    'stock',
    'image',
    'blurb',
    'rank',
])]
class Product extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'compare_at' => 'integer',
            'sizes' => 'array',
            'stock' => 'boolean',
            'rank' => 'integer',
        ];
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toCatalog(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'brand' => $this->brand,
            'price' => $this->price,
            'compareAt' => $this->compare_at,
            'gender' => $this->gender,
            'category' => $this->category,
            'color' => $this->color,
            'sizes' => $this->sizes,
            'season' => $this->season,
            'badge' => $this->badge,
            'stock' => $this->stock,
            'image' => $this->image,
            'blurb' => $this->blurb,
            'rank' => $this->rank,
        ];
    }
}
