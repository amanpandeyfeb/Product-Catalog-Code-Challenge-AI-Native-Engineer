export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
}

export interface Category {
  name: string;
  count: number;
}

export interface EnquiryInput {
  productId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "Something went wrong.");
  }
  return payload as T;
}

export const catalogApi = {
  getCategories: (signal?: AbortSignal) => request<Category[]>("/categories", { signal }),
  getFeaturedProducts: (signal?: AbortSignal) => request<Product[]>("/products/featured", { signal }),
  getProducts: (signal?: AbortSignal) => request<Product[]>("/products", { signal }),
  getCategoryProducts: (category: string, signal?: AbortSignal) =>
    request<Product[]>(`/categories/${encodeURIComponent(category)}/products`, { signal }),
  searchProducts: (query: string, signal?: AbortSignal) =>
    request<Product[]>(`/products/search?q=${encodeURIComponent(query)}`, { signal }),
  getProduct: (id: string, signal?: AbortSignal) =>
    request<Product>(`/products/${encodeURIComponent(id)}`, { signal }),
  submitEnquiry: (input: EnquiryInput) =>
    request<{ message: string }>("/enquiries", { method: "POST", body: JSON.stringify(input) }),
};