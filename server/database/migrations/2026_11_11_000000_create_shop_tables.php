<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('brand');
            $table->unsignedInteger('price');
            $table->unsignedInteger('compare_at')->nullable();
            $table->string('gender');
            $table->string('category');
            $table->string('color');
            $table->json('sizes');
            $table->string('season');
            $table->string('badge')->nullable();
            $table->boolean('stock')->default(true);
            $table->string('image');
            $table->text('blurb');
            $table->unsignedInteger('rank');
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->string('name');
            $table->string('phone');
            $table->string('city');
            $table->string('delivery');
            $table->string('address');
            $table->string('payment');
            $table->string('promo')->nullable();
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('total');
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('product_id');
            $table->foreign('product_id')->references('id')->on('products');
            $table->string('title');
            $table->string('brand');
            $table->unsignedSmallInteger('size');
            $table->unsignedTinyInteger('qty');
            $table->unsignedInteger('price');
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
    }
};
