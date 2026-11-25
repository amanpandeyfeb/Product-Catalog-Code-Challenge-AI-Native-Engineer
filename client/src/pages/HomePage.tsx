import { ErrorState } from "../components/PageSections";
import ProductGrid, { ProductGridSkeleton } from "../components/ProductGrid";
import { useProducts } from "../hooks/useProducts";

export default function HomePage() {
  const { products, isLoading, error } = useProducts({ type: "featured" });

  return <section className="section-block">
    <h1 className="discover-heading">Explore our top 5 products</h1>
    {error ? <ErrorState message={error} /> : isLoading ? <ProductGridSkeleton count={5} /> : <ProductGrid products={products} />}
  </section>;
}
