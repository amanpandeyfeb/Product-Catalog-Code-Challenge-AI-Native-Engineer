import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, PageIntro } from "../components/PageSections";
import ProductGrid, { ProductGridSkeleton } from "../components/ProductGrid";
import { useProducts } from "../hooks/useProducts";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const { products, isLoading, error } = useProducts({ type: "search", value: query });

  return <section className="listing-page">
    <PageIntro eyebrow="SEARCH THE COLLECTION" title={query ? <>Results for <em>“{query}”</em></> : "What are you looking for?"} description={query ? `${products.length} matching ${products.length === 1 ? "object" : "objects"} across the collection.` : "Enter a product name, detail, or category in the search bar above."} />
    {error ? <ErrorState message={error} /> : isLoading ? <ProductGridSkeleton count={4} /> : !query ? null : products.length ? <ProductGrid products={products} /> : <EmptyState query={query} />}
  </section>;
}
