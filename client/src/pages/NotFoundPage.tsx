import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <section className="empty-state not-found"><span className="empty-state__symbol">404</span><h2>This page wandered off.</h2><p>That address doesn't lead to a piece in our collection.</p><Link className="text-link" to="/">Return to the collection <ArrowRight size={17} /></Link></section>;
}