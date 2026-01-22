import { X, Minus, Plus, Trash2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { addBusinessDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    maxProductionDays,
  } = useCart();

  const estimatedShipDate = addBusinessDays(new Date(), maxProductionDays);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="font-serif text-xl">Sua Sacola</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg mb-2">Sua sacola está vazia</h3>
            <p className="text-sm text-muted-foreground">
              Explore nossa coleção de peças feitas à mão
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 p-4 bg-card rounded-2xl"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tamanho: {item.size}
                      </p>
                      <p className="text-xs text-olive mt-1">
                        Produção: {item.product.productionDays} dias
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.product.id, item.size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              {/* Production notice */}
              <div className="bg-olive-light/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-olive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-olive">Feito sob encomenda</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Envio estimado: {format(estimatedShipDate, "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-serif text-xl font-semibold">{formatPrice(subtotal)}</span>
              </div>

              {/* Checkout button */}
              <Button className="w-full h-12 rounded-xl font-medium">
                Finalizar Compra
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Frete calculado no checkout
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
