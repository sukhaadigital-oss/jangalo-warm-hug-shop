export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: 'novidades' | 'menina' | 'menino' | 'bebe' | 'essenciais' | 'sale';
  sizes: string[];
  images: string[];
  productionDays: number;
  stock: number;
  isNew?: boolean;
  isSale?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}
