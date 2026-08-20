import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { supabaseToLegacyProduct } from '@/types/product';
import { products as localProducts } from '@/data/products';

export const FeaturedProducts = () => {
  const { products: supabaseProducts, isLoading } = useProducts();

  // Use Supabase products if available, otherwise fall back to local
  const displayProducts = supabaseProducts.length > 0
    ? supabaseProducts.slice(0, 4).map(supabaseToLegacyProduct)
    : localProducts.slice(0, 4);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-2">
            Destaque
          </h2>
          <p className="text-muted-foreground">
            Peças recém-chegadas, feitas com amor
          </p>
        </div>
        <Button asChild variant="ghost" className="self-start md:self-auto">
          <Link to="/produtos">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
