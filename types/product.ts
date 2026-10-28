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