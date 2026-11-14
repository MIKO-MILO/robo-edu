export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  productType: {
    id: string;
    name: string;
    slug: string;
  };

  image: string | null;

  price: {
    min: number;
    max: number;
  };

  stock: number;

  // Nullable — null when the product has no published reviews yet.
  rating_avg: number | null;
  review_count: number | null;
};

export type ProductResponse = {
  data: Product[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};