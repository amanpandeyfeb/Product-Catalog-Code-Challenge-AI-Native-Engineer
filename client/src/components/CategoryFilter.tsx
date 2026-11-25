import { NavLink } from "react-router-dom";
import { useCatalog } from "../CatalogContext";
import { ALL_PRODUCTS_PATH, categoryPath } from "../utils/format";

export default function CategoryFilter() {
  const { categories, categoryError } = useCatalog();
  const total = categories.reduce((sum, category) => sum + category.count, 0);
  return (
    <nav className="category-strip" aria-label="Filter by category">
      <NavLink to={ALL_PRODUCTS_PATH} end>Trending{categories.length > 0 && <span className="category-strip__count">{total}</span>}</NavLink>
      {categories.map(({ name, count }) => <NavLink key={name} to={categoryPath(name)}>{name}<span className="category-strip__count">{count}</span></NavLink>)}
      {categoryError && <span className="category-strip__error">{categoryError}</span>}
    </nav>
  );
}
