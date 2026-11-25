import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { after, before, beforeEach, test } from "node:test";
import { createApp } from "../src/app.ts";
import type { Product } from "../src/catalog.ts";
import { handler } from "../src/lambda.ts";

const products: Product[] = [
  { id: 1, title: "Canvas bag", price: 20, description: "A sturdy tote", category: "bags", image: "" },
  { id: 2, title: "Silver ring", price: 30, description: "A polished accessory", category: "jewelry", image: "", rating: { rate: 4.8, count: 20 } },
  { id: 3, title: "Gold ring", price: 40, description: "A hand-finished ring", category: "jewelry", image: "", rating: { rate: 4.2, count: 10 } },
];

const sentEnquiries: Array<{ productId: number; email: string }> = [];
const app = createApp({
  catalog: {
    getProducts: async () => products,
    getProduct: async (id) => {
      const product = products.find((candidate) => candidate.id === id);
      if (!product) throw new Error("Product not found.");
      return product;
    },
    getCategories: async () => ["bags", "jewelry"],
    getCategoryProducts: async (category) => products.filter((product) => product.category === category),
  },
  sendEmail: async (product, enquiry) => {
    sentEnquiries.push({ productId: product.id, email: enquiry.email });
  },
});

let server: ReturnType<typeof app.listen>;
let apiUrl: string;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  apiUrl = `http://127.0.0.1:${address.port}/api`;
});

after(async () => {
  server.closeAllConnections();
  server.close();
  await once(server, "close");
});

beforeEach(() => sentEnquiries.splice(0));

test("featured route returns five or fewer products ranked by rating then price", async () => {
  const response = await fetch(`${apiUrl}/products/featured`);
  const result = await response.json() as Product[];

  assert.equal(response.status, 200);
  assert.deepEqual(result.map((product) => product.id), [2, 3, 1]);
});

test("all products route returns the full ranked list", async () => {
  const response = await fetch(`${apiUrl}/products`);
  const result = await response.json() as Product[];

  assert.equal(response.status, 200);
  assert.equal(result.length, products.length);
  assert.deepEqual(result.map((product) => product.id), [2, 3, 1]);
});

test("categories route returns provider categories with product counts", async () => {
  const response = await fetch(`${apiUrl}/categories`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [{ name: "bags", count: 1 }, { name: "jewelry", count: 2 }]);
});

test("category route returns only matching products in ranked order", async () => {
  const response = await fetch(`${apiUrl}/categories/jewelry/products`);
  const result = await response.json() as Product[];

  assert.equal(response.status, 200);
  assert.deepEqual(result.map((product) => product.id), [2, 3]);
});

test("search route trims and matches product text without case sensitivity", async () => {
  const response = await fetch(`${apiUrl}/products/search?q=%20RING%20`);
  const result = await response.json() as Product[];

  assert.equal(response.status, 200);
  assert.deepEqual(result.map((product) => product.id), [2, 3]);
});

test("search route rejects a missing query", async () => {
  const response = await fetch(`${apiUrl}/products/search`);

  assert.equal(response.status, 400);
  assert.equal((await response.json() as { error: string }).error, "Enter a search term.");
});

test("product route returns a product and validates its ID", async () => {
  const response = await fetch(`${apiUrl}/products/2`);
  const result = await response.json() as Product;
  const invalid = await fetch(`${apiUrl}/products/not-an-id`);

  assert.equal(response.status, 200);
  assert.equal(result.title, "Silver ring");
  assert.equal(invalid.status, 400);
});

test("unknown products return 404", async () => {
  const response = await fetch(`${apiUrl}/products/999`);

  assert.equal(response.status, 404);
  assert.equal((await response.json() as { error: string }).error, "Product not found.");
});

test("invalid enquiry is rejected without sending email", async () => {
  const response = await fetch(`${apiUrl}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: 2, name: "S", email: "not-an-email", message: "short" }),
  });

  assert.equal(response.status, 400);
  assert.equal(sentEnquiries.length, 0);
});

test("valid enquiry resolves product, sends email, and returns accepted", async () => {
  const response = await fetch(`${apiUrl}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: 2, name: "Sam Lee", email: "sam@example.test", message: "Can you tell me more about this ring?" }),
  });

  assert.equal(response.status, 202);
  assert.equal((await response.json() as { message: string }).message, "Your enquiry has been sent.");
  assert.deepEqual(sentEnquiries, [{ productId: 2, email: "sam@example.test" }]);
});

test("Lambda handler serves an API Gateway HTTP API health request", async () => {
  const result = await handler({
    version: "2.0",
    routeKey: "GET /api/health",
    rawPath: "/api/health",
    rawQueryString: "",
    headers: { host: "example.test" },
    requestContext: { http: { method: "GET", path: "/api/health", sourceIp: "127.0.0.1" } },
    isBase64Encoded: false,
  }, {} as never, () => {});

  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { status: "ok" });
});
