import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogApi } from "../src/api";

describe("catalog API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } }),
    ));
  });

  it("sends search terms to the backend rather than the product provider", async () => {
    await catalogApi.searchProducts("silver ring");
    expect(fetch).toHaveBeenCalledWith(
      "/api/products/search?q=silver%20ring",
      expect.objectContaining({ headers: { "Content-Type": "application/json" } }),
    );
  });

  it("submits enquiries to the backend", async () => {
    await catalogApi.submitEnquiry({ productId: 7, name: "Sam Lee", email: "sam@example.com", message: "Could you tell me more?" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/enquiries",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("sam@example.com") }),
    );
  });

  it("encodes category names in backend requests", async () => {
    await catalogApi.getCategoryProducts("men's clothing");
    expect(fetch).toHaveBeenCalledWith(
      "/api/categories/men's%20clothing/products",
      expect.any(Object),
    );
  });

  it("requests product details through the backend", async () => {
    await catalogApi.getProduct("12");
    expect(fetch).toHaveBeenCalledWith("/api/products/12", expect.any(Object));
  });

  it("surfaces the backend error message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "The request could not be completed." }), { status: 502 }),
    ));

    await expect(catalogApi.getProducts()).rejects.toThrow("The request could not be completed.");
  });
});