import { useEffect, useState } from "react";
import { catalogApi, type Product } from "../api";

export type ProductQuery =
  | { type: "featured" }
  | { type: "all" }
  | { type: "category"; value: string }
  | { type: "search"; value: string };

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string;
}

export function useProducts(query: ProductQuery): ProductsState {
  const { type } = query;
  const value = type === "featured" || type === "all" ? "" : query.value;
  const [state, setState] = useState<ProductsState>({ products: [], isLoading: true, error: "" });

  useEffect(() => {
    if (type === "search" && !value) {
      setState({ products: [], isLoading: false, error: "" });
      return;
    }

    const controller = new AbortController();
    setState({ products: [], isLoading: true, error: "" });

    const request = type === "featured"
      ? catalogApi.getFeaturedProducts(controller.signal)
      : type === "all"
        ? catalogApi.getProducts(controller.signal)
        : type === "category"
        ? catalogApi.getCategoryProducts(value, controller.signal)
        : catalogApi.searchProducts(value, controller.signal);

    request
      .then((products) => setState({ products, isLoading: false, error: "" }))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setState({ products: [], isLoading: false, error: reason instanceof Error ? reason.message : "Unable to load products." });
      });

    return () => controller.abort();
  }, [type, value]);

  return state;
}

interface ProductState {
  product: Product | null;
  isLoading: boolean;
  error: string;
}

export function useProduct(id: string): ProductState {
  const [state, setState] = useState<ProductState>({ product: null, isLoading: true, error: "" });

  useEffect(() => {
    if (!id) {
      setState({ product: null, isLoading: false, error: "Product not found." });
      return;
    }

    const controller = new AbortController();
    setState({ product: null, isLoading: true, error: "" });
    catalogApi.getProduct(id, controller.signal)
      .then((product) => setState({ product, isLoading: false, error: "" }))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setState({ product: null, isLoading: false, error: reason instanceof Error ? reason.message : "Unable to load product." });
      });

    return () => controller.abort();
  }, [id]);

  return state;
}