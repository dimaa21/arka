<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShopTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_lists_the_bundled_pairs(): void
    {
        $this->seed();

        $response = $this->getJson('/api/products');

        $response->assertOk();
        $this->assertGreaterThan(30, count($response->json('products')));
        $response->assertJsonFragment(['id' => 'nike-air-force-1', 'price' => 5300]);
    }

    public function test_order_applies_the_percent_promo(): void
    {
        $this->seed();

        $response = $this->postJson('/api/orders', $this->order([
            'promo' => 'arka10',
            'items' => [['id' => 'nike-air-force-1', 'size' => 42, 'qty' => 1]],
        ]));

        $response->assertCreated();
        $response->assertJsonPath('subtotal', 5300);
        $response->assertJsonPath('discount', 530);
        $response->assertJsonPath('total', 4770);
        $response->assertJsonPath('promo', 'ARKA10');
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_welcome_promo_needs_the_minimum_total(): void
    {
        $this->seed();

        $this->postJson('/api/orders', $this->order([
            'promo' => 'WELCOME',
            'items' => [['id' => 'nike-victori-one', 'size' => 42, 'qty' => 1]],
        ]))->assertStatus(422);

        $this->postJson('/api/orders', $this->order([
            'promo' => 'WELCOME',
            'items' => [['id' => 'nike-air-force-1', 'size' => 42, 'qty' => 1]],
        ]))->assertJsonPath('discount', 300);
    }

    public function test_missing_size_and_sold_out_pairs_are_rejected(): void
    {
        $this->seed();

        $this->postJson('/api/orders', $this->order([
            'items' => [['id' => 'nike-air-force-1', 'size' => 28, 'qty' => 1]],
        ]))->assertStatus(422);

        $this->postJson('/api/orders', $this->order([
            'items' => [['id' => 'nike-air-max-97-men', 'size' => 42, 'qty' => 1]],
        ]))->assertStatus(422);
    }

    public function test_contact_message_is_stored(): void
    {
        $response = $this->postJson('/api/messages', [
            'name' => 'Ігор',
            'email' => 'ihor@example.com',
            'message' => 'Чи є розмір 43?',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('messages', ['email' => 'ihor@example.com']);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function order(array $overrides): array
    {
        return array_merge([
            'name' => 'Олена',
            'phone' => '+380671112233',
            'city' => 'Івано-Франківськ',
            'delivery' => 'branch',
            'address' => 'Відділення 5',
            'payment' => 'cod',
            'promo' => '',
            'items' => [['id' => 'nike-air-force-1', 'size' => 42, 'qty' => 1]],
        ], $overrides);
    }
}
