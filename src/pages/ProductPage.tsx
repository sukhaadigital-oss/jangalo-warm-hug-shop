import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Ruler, Minus, Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { products } from '@/data/products';
import { addBusinessDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const sizeGuide = [
  { size: 'RN', height: 'até 50cm', weight: 'até 3.5kg' },
  { size: 'P', height: '50-56cm', weight: '3.5-5kg' },
  { size: 'M', height: '56-62cm', weight: '5-7kg' },
  { size: 'G', height: '62-68cm', weight: '7-9kg' },
  { size: '1', height: '74-80cm', weight: '9-11kg' },
  { size: '2', height: '80-86cm', weight: '11-13kg' },
  { size: '3', height: '86-92cm', weight: '13-15kg' },
  { size: '4', height: '92-98cm', weight: '15-17kg' },
  { size: '6', height: '104-110cm', weight: '18-21kg' },
  { size: '8', height: '116-122cm', weight: '23-26kg' },
  { size: '10', height: '128-134cm', weight: '28-32kg' },
];

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl mb-4">Produto não encontrado</h1>
          <Button asChild>
            <Link to="/produtos">Voltar para a loja</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const estimatedShipDate = addBusinessDays(new Date(), product.productionDays);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize, quantity);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a loja
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-card">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-2">
              {product.isNew && (
                <Badge className="bg-olive text-olive-foreground hover:bg-olive">
                  Novidade
                </Badge>
              )}
              {product.isSale && <Badge variant="destructive">Promoção</Badge>}
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl font-semibold">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Tamanho</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                      <Ruler className="h-4 w-4" />
                      Guia de Medidas
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl">
                        Guia de Medidas
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Tamanho</th>
                            <th className="text-left py-2">Altura</th>
                            <th className="text-left py-2">Peso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizeGuide.map((row) => (
                            <tr key={row.size} className="border-b border-border/50">
                              <td className="py-2 font-medium">{row.size}</td>
                              <td className="py-2 text-muted-foreground">
                                {row.height}
                              </td>
                              <td className="py-2 text-muted-foreground">
                                {row.weight}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 min-w-[44px] px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Production Time Notice */}
            <div className="bg-olive-light/50 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Leaf className="h-5 w-5 text-olive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-olive mb-1">
                    🌿 Feito à mão especialmente para você
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Prazo de confecção: {product.productionDays} dias úteis + prazo
                    de entrega
                  </p>
                  <p className="text-sm text-olive mt-2">
                    Envio estimado:{' '}
                    {format(estimatedShipDate, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 h-12 rounded-xl font-medium"
                disabled={!selectedSize || product.stock === 0}
                onClick={handleAddToCart}
              >
                {product.stock === 0
                  ? 'Esgotado'
                  : selectedSize
                  ? 'Adicionar à Sacola'
                  : 'Selecione um tamanho'}
              </Button>

              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Stock */}
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-sm text-primary">
                Atenção: apenas {product.stock} unidades disponíveis
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
