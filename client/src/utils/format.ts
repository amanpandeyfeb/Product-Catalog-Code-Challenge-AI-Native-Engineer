const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatPrice = (price: number) => currency.format(price);

export const categoryPath = (category: string) => `/category/${encodeURIComponent(category)}`;

export const ALL_PRODUCTS_PATH = "/products";
