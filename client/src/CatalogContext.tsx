import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { catalogApi, type Category } from "./api";

interface CatalogContextValue {
  categories: Category[];
  categoryError: string;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    catalogApi.getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {
        if (!controller.signal.aborted) setCategoryError("Categories are temporarily unavailable.");
      });
    return () => controller.abort();
  }, []);

  return (
    <CatalogContext.Provider value={{ categories, categoryError }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider.");
  return context;
}