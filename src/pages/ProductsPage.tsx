import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { supabaseToLegacyProduct } from '@/types/product';
import { products as localProducts } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

// Static categories
const staticCategories = [
  { id: '1', name: 'Menina', slug: 'menina' },
  { id: '2', name: 'Menino', slug: 'menino' },
  { id: '3', name: 'Bebê', slug: 'bebe' },
  { id: '4', name: 'Essenciais', slug: 'essenciais' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('categoria');
  const { products: supabaseProducts, isLoading } = useProducts();

  // Use Supabase products if available, otherwise fall back to local
  const allProducts = supabaseProducts.length > 0
    ? supabaseProducts.map(supabaseToLegacyProduct)
    : localProducts;

  const filteredProducts = activeCategory
    ? allProducts.filter((p) => {
        if (activeCategory === 'novidades') return p.isNew;
        if (activeCategory === 'sale') return p.isSale;
        return p.category === activeCategory;
      })
    : allProducts;

  const categoryName = activeCategory
    ? staticCategories.find((c) => c.slug === activeCategory)?.name ||
      (activeCategory === 'novidades'
        ? 'Novidades'
        : activeCategory === 'sale'
        ? 'Promoção'
        : 'Todos')
    : 'Todos os Produtos';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para início
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-2">
            {categoryName}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} produto
            {filteredProducts.length !== 1 ? 's' : ''} encontrado
            {filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={!activeCategory ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setSearchParams({})}
          >
            Todos
          </Button>
          <Button
            variant={activeCategory === 'novidades' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setSearchParams({ categoria: 'novidades' })}
          >
            Novidades
          </Button>
          {staticCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => setSearchParams({ categoria: category.slug })}
            >
              {category.name}
            </Button>
          ))}
          <Button
            variant={activeCategory === 'sale' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full',
              activeCategory !== 'sale' && 'text-primary border-primary hover:bg-primary hover:text-primary-foreground'
            )}
            onClick={() => setSearchParams({ categoria: 'sale' })}
          >
            Sale
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Nenhum produto encontrado nesta categoria.
            </p>
            <Button asChild variant="link" className="mt-4">
              <Link to="/produtos">Ver todos os produtos</Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
