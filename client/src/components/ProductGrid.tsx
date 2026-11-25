import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { Product } from "../api";
import { formatPrice } from "../utils/format";

function ProductCard({ product, index }: { product: Product; index: number }) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  return (
    <Link className="product-card" to={`/products/${product.id}`} state={{ from }} style={{ animationDelay: `${index * 55}ms` }}>
      <div className="product-card__image-wrap">
        <img src={product.image} alt={product.title} loading="lazy" />
        <span className="product-card__arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </div>
      <div className="product-card__meta">
        <span className="eyebrow">{product.category}</span>
        {product.rating && <span className="rating">★ {product.rating.rate.toFixed(1)}</span>}
      </div>
      <div className="product-card__title-row">
        <h3>{product.title}</h3>
        <span>{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>;
}

export function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="product-grid" role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="product-card product-card--skeleton" aria-hidden="true">
          <div className="product-card__image-wrap skeleton" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}
