import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="group product-card">
      <Link to={`/produto/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-olive text-olive-foreground hover:bg-olive">
                Novidade
              </Badge>
            )}
            {product.isSale && (
              <Badge variant="destructive">
                Promoção
              </Badge>
            )}
          </div>

          {/* Stock warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="text-xs">
                Últimas {product.stock} unidades
              </Badge>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="font-medium text-muted-foreground">Esgotado</span>
            </div>
          )}
        </div>

        <div className="p-4 pb-0">
          <h3 className="font-serif text-base font-medium leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4 pt-3">
        {product.stock === 0 ? (
          <Button size="sm" className="w-full rounded-xl" disabled>
            Esgotado
          </Button>
        ) : (
          <Button asChild size="sm" className="w-full rounded-xl">
            <Link to={`/produto/${product.id}`}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Comprar
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
