export interface Product {
  id: number;
  product_name: string;
  category: string;
  price: number;
  stock: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateProductBody {
  product_name: string;
  category: string;
  price: number;
  stock: number;
}

export interface UpdateProductBody {
  product_name: string;
  category: string;
  price: number;
  stock: number;
}

export interface ApiResponse {
  message: string;
  status: number;
  product?: Partial<Product>;
}