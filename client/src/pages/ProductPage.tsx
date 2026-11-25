import { useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import EnquiryDialog from "../components/EnquiryDialog";
import { ErrorState, LoadingState } from "../components/PageSections";
import { useProduct } from "../hooks/useProducts";
import { categoryPath, formatPrice } from "../utils/format";

export default function ProductPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { product, isLoading, error } = useProduct(id);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const previousLocation = (location.state as { from?: unknown } | null)?.from;
  const returnTo = typeof previousLocation === "string" && previousLocation.startsWith("/") && !previousLocation.startsWith("//")
    ? previousLocation
    : "/";
  const categorySource = returnTo.startsWith("/category/")
    ? decodeURIComponent(returnTo.slice("/category/".length).split("/")[0])
    : "";

  if (error) return <section className="listing-page"><ErrorState message={error} /></section>;
  if (isLoading || !product) return <section className="listing-page"><LoadingState /></section>;

  return <section className="product-detail">
    <Link to={returnTo} className="back-link"><ArrowLeft size={16} /> {returnTo === "/" ? "Back to Discover" : categorySource ? `Back to ${categorySource}` : returnTo.startsWith("/search") ? "Back to search results" : "Back to products"}</Link>
    <div className="product-detail__layout">
      <div className="product-detail__image"><img src={product.image} alt={product.title} /></div>
      <div className="product-detail__info">
        <p className="eyebrow">OBJECT NO. {String(product.id).padStart(3, "0")} / {product.category}</p>
        <h1>{product.title}</h1>
        {product.rating && <p className="detail-rating"><span>★ {product.rating.rate.toFixed(1)}</span> · {product.rating.count} reviews</p>}
        <p className="product-detail__price">{formatPrice(product.price)}</p>
        <div className="detail-rule" />
        <p className="product-detail__description">{product.description}</p>
        <button className="button button--primary enquire-trigger" onClick={() => setEnquiryOpen(true)}>Enquire about this piece <ArrowUpRight size={18} /></button>
        <p className="product-detail__note">Have a question? Our team would love to help.</p>
        {categorySource.toLowerCase() !== product.category.toLowerCase() && <Link className="product-category-link" to={categoryPath(product.category)}>Browse {product.category} <ArrowUpRight size={16} /></Link>}
        <div className="detail-facts"><span>Thoughtful design</span><span>Made for everyday use</span><span>Selected with care</span></div>
      </div>
    </div>
    {enquiryOpen && <EnquiryDialog product={product} onClose={() => setEnquiryOpen(false)} />}
  </section>;
}
