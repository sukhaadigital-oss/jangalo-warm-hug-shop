// Legacy product type for backward compatibility with local data
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

// Supabase product type
export interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  description: string | null;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

// Helper to convert Supabase product to legacy format for display
export const supabaseToLegacyProduct = (sp: SupabaseProduct): Product => ({
  id: sp.id,
  name: sp.name,
  price: sp.price,
  originalPrice: sp.original_price ?? undefined,
  description: sp.description ?? '',
  category: sp.category as Product['category'],
  sizes: ['P', 'M', 'G'], // Default sizes - can be extended later
  images: sp.image_url ? [sp.image_url] : ['/placeholder.svg'],
  productionDays: 5, // Default production days - can be extended later
  stock: sp.in_stock ? 10 : 0, // Simplified stock based on in_stock flag
  isNew: sp.featured,
  isSale: !!sp.original_price && sp.original_price > sp.price,
});
