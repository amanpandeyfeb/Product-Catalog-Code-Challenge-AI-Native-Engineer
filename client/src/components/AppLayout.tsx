import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ALL_PRODUCTS_PATH } from "../utils/format";

function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [term, setTerm] = useState(currentQuery);

  useEffect(() => setTerm(currentQuery), [currentQuery]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = term.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form className="search" role="search" onSubmit={submitSearch}>
      <Search size={17} aria-hidden="true" />
      <input aria-label="Search products" placeholder="Search the collection" value={term} onChange={(event) => setTerm(event.target.value)} />
      <button type="submit" aria-label="Submit search" title="Search"><ArrowRight size={18} /></button>
    </form>
  );
}

function Wordmark({ footer = false }: { footer?: boolean }) {
  return <Link to="/" className={footer ? "wordmark wordmark--footer" : "wordmark"}>ShopYourself</Link>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const onCategoryPages = pathname === ALL_PRODUCTS_PATH || pathname.startsWith("/category/");

  return (
    <div className="app-shell">
      <header className="site-header">
        <Wordmark />
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/" end>Discover</NavLink>
          <NavLink to={ALL_PRODUCTS_PATH} className={onCategoryPages ? "active" : undefined}>Category</NavLink>
        </nav>
        <SearchBar />
      </header>
      <main>{children}</main>
      <footer className="site-footer"><Wordmark footer /><span>Good things, chosen well.</span></footer>
    </div>
  );
}
