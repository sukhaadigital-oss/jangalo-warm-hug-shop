import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string | null;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('products').insert(product);

    if (error) {
      console.error('Error adding product:', error);
      toast.error('Erro ao adicionar produto');
      return false;
    }

    toast.success('Produto adicionado com sucesso!');
    return true;
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
      return false;
    }

    toast.success('Produto atualizado com sucesso!');
    return true;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao remover produto');
      return false;
    }

    toast.success('Produto removido com sucesso!');
    return true;
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        refetch: fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
};
