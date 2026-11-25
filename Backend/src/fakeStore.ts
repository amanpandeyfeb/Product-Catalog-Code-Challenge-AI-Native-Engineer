import { z } from "zod";
import type { Product } from "./catalog.js";

const ProductSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
  rating: z.object({ rate: z.number(), count: z.number() }).optional(),
});

const API_URL = process.env.FAKE_STORE_API_URL ?? "https://fakestoreapi.com";

async function request<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(8000) });
  } catch {
    throw new Error("The product source could not be reached.");
  }

  if (!response.ok) {
    if (response.status === 404) throw new Error("Product not found.");
    throw new Error("The product source returned an error.");
  }

  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) throw new Error("The product source returned unexpected data.");
  return parsed.data;
}

export const fakeStore = {
  getProducts: () => request("/products", z.array(ProductSchema)),
  getProduct: (id: number) => request(`/products/${id}`, ProductSchema),
  getCategories: () => request("/products/categories", z.array(z.string())),
  getCategoryProducts: (category: string) =>
    request(`/products/category/${encodeURIComponent(category)}`, z.array(ProductSchema)),
};