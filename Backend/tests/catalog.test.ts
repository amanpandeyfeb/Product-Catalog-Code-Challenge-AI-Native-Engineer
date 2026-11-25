import assert from "node:assert/strict";
import test from "node:test";
import { countByCategory, getFeaturedProducts, rankProducts, searchProducts, type Product } from "../src/catalog.ts";

const products: Product[] = [
  { id: 1, title: "Canvas bag", price: 20, description: "A sturdy tote", category: "bags", image: "", rating: { rate: 4.2, count: 10 } },
  { id: 2, title: "Silver ring", price: 30, description: "A polished accessory", category: "jewelry", image: "", rating: { rate: 4.8, count: 20 } },
  { id: 3, title: "Leather bag", price: 40, description: "Hand-finished", category: "bags", image: "", rating: { rate: 4.8, count: 5 } },
];

test("featured products are ranked by rating without mutating the source", () => {
  assert.deepEqual(getFeaturedProducts(products, 2).map(({ id }) => id), [2, 3]);
  assert.deepEqual(products.map(({ id }) => id), [1, 2, 3]);
});

test("search matches title, description, and category without case sensitivity", () => {
  assert.deepEqual(searchProducts(products, "BAG").map(({ id }) => id), [1, 3]);
  assert.deepEqual(searchProducts(products, "polished").map(({ id }) => id), [2]);
  assert.deepEqual(searchProducts(products, "  "), []);
});

test("rated products come first; unrated products fall back to price", () => {
  const mixed: Product[] = [
    { id: 10, title: "Cheap", price: 5, description: "", category: "x", image: "" },
    { id: 11, title: "Rated", price: 1, description: "", category: "x", image: "", rating: { rate: 3, count: 1 } },
    { id: 12, title: "Pricey", price: 50, description: "", category: "x", image: "" },
  ];
  assert.deepEqual(rankProducts(mixed).map(({ id }) => id), [11, 12, 10]);
});

test("products without ratings are ordered by price with ID as a stable tie-breaker", () => {
  const unrated: Product[] = [
    { id: 8, title: "Mid", price: 10, description: "", category: "x", image: "" },
    { id: 4, title: "High B", price: 20, description: "", category: "x", image: "" },
    { id: 2, title: "High A", price: 20, description: "", category: "x", image: "" },
  ];

  assert.deepEqual(rankProducts(unrated).map(({ id }) => id), [2, 4, 8]);
  assert.deepEqual(unrated.map(({ id }) => id), [8, 4, 2]);
});

test("featured selection defaults to five and never exceeds available products", () => {
  assert.equal(getFeaturedProducts(products).length, 3);
  assert.equal(getFeaturedProducts(products, 2).length, 2);
});

test("category counts keep the given order and include empty categories", () => {
  assert.deepEqual(countByCategory(["jewelry", "bags", "empty"], products), [
    { name: "jewelry", count: 1 },
    { name: "bags", count: 2 },
    { name: "empty", count: 0 },
  ]);
});

test("search returns no results for unmatched text", () => {
  assert.deepEqual(searchProducts(products, "not-in-this-catalog"), []);
});