import { useParams } from "react-router-dom";
import CategoryFilter from "../components/CategoryFilter";
import { ErrorState, PageIntro } from "../components/PageSections";
import ProductGrid, { ProductGridSkeleton } from "../components/ProductGrid";
import { useProducts } from "../hooks/useProducts";

// Serves both /category/:category and /products ("Trending").
export default function CategoryPage() {
  const { category } = useParams();
  const { products, isLoading, error } = useProducts(category ? { type: "category", value: category } : { type: "all" });
  const label = category ?? "Trending";
  const highlights = products.slice(0, 3);
  const remaining = products.slice(3);

  return <>
    <CategoryFilter />
    <section className="listing-page">
      <PageIntro eyebrow="THE COLLECTION / CATEGORY" title={label} description="A closer look at pieces selected for quality, utility, and the details that make a difference." />
      {error ? <ErrorState message={error} /> : isLoading ? <ProductGridSkeleton count={8} /> : <>
        <div className="section-heading section-heading--compact"><div><p className="eyebrow">TOP RATED</p><h2>{category ? `Most loved in ${category}.` : "Most loved right now."}</h2></div><span className="section-heading__aside">{highlights.length} highlights</span></div>
        <ProductGrid products={highlights} />
        {remaining.length > 0 && <><div className="section-heading section-heading--compact section-heading--more"><div><p className="eyebrow">THE FULL EDIT</p><h2>More to explore.</h2></div><span className="section-heading__aside">{remaining.length} more pieces</span></div><ProductGrid products={remaining} /></>}
      </>}
    </section>
  </>;
}
