export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export function rankProducts(products: Product[]): Product[] {
  return [...products].sort((first, second) => {
    const firstRate = first.rating?.rate;
    const secondRate = second.rating?.rate;
    if (firstRate !== undefined && secondRate !== undefined) return secondRate - firstRate || first.id - second.id;
    if (firstRate !== undefined) return -1;
    if (secondRate !== undefined) return 1;
    return second.price - first.price || first.id - second.id;
  });
}

export function getFeaturedProducts(products: Product[], count = 5): Product[] {
  return rankProducts(products).slice(0, count);
}

export function searchProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [];

  return products.filter((product) =>
    [product.title, product.description, product.category]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
  );
}

export interface CategoryCount {
  name: string;
  count: number;
}

export function countByCategory(names: string[], products: Product[]): CategoryCount[] {
  return names.map((name) => ({ name, count: products.filter((product) => product.category === name).length }));
}