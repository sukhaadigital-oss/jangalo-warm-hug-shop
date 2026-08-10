import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, QrCode, Copy, Check, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { addBusinessDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
  address: z.string().trim().min(10, 'Endereço deve ter pelo menos 10 caracteres').max(500),
});

type CustomerData = z.infer<typeof customerSchema>;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, maxProductionDays, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerData>>({});

  const estimatedShipDate = addBusinessDays(new Date(), maxProductionDays);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Simulated PIX key (in production, integrate with payment gateway)
  const pixKey = 'jangalokids@email.com';
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865802BR5913JANGALO KIDS6008SAO PAULO62070503***63041D3D`;

  const validateForm = (): boolean => {
    try {
      customerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<CustomerData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CustomerData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
        productionDays: item.product.productionDays,
      }));

      const newOrderId = crypto.randomUUID();

      const { error } = await supabase
        .from('orders')
        .insert({
          id: newOrderId,
          customer_name: formData.name.trim(),
          customer_phone: formData.phone.trim(),
          customer_address: formData.address.trim(),
          items: orderItems,
          total: subtotal,
          status: 'pending_payment',
        });

      if (error) throw error;

      setOrderId(newOrderId);
      setStep('payment');
      toast.success('Pedido criado! Agora faça o pagamento via PIX.');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('confirm_order_payment', {
        _order_id: orderId,
      });

      if (error) throw error;
      if (!data) throw new Error('Order not found or already confirmed');

      clearCart();
      setStep('success');
      toast.success('Pagamento confirmado! Obrigado pela compra.');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Erro ao confirmar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Leaf className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-serif text-2xl mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-6">Adicione produtos para continuar</p>
        <Button onClick={() => navigate('/produtos')}>Ver Produtos</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'info' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'info' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="hidden sm:inline">Dados</span>
          </div>
          <Separator className="w-12" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="hidden sm:inline">Pagamento</span>
          </div>
          <Separator className="w-12" />
          <div className={`flex items-center gap-2 ${step === 'success' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="hidden sm:inline">Confirmado</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column - Form/Payment */}
          <div className="md:col-span-2">
            {step === 'info' && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Informações de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
                      rows={3}
                      className={errors.address ? 'border-destructive' : ''}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>

                  <Button 
                    className="w-full h-12" 
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Continuar para Pagamento'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Pagamento via PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted rounded-xl p-6 text-center">
                    <div className="w-48 h-48 mx-auto bg-background rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-muted-foreground/30">
                      <QrCode className="w-32 h-32 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Escaneie o QR Code ou copie o código PIX
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Código PIX Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input value={pixCode} readOnly className="font-mono text-xs" />
                      <Button variant="outline" onClick={handleCopyPix}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-olive-light/50 rounded-xl p-4">
                    <p className="text-sm font-medium text-olive">Valor a pagar</p>
                    <p className="text-2xl font-serif font-bold">{formatPrice(subtotal)}</p>
                  </div>

                  <Button 
                    className="w-full h-12" 
                    onClick={handleConfirmPayment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      'Já fiz o pagamento'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Após o pagamento, enviaremos a confirmação pelo WhatsApp
                  </p>
                </CardContent>
              </Card>
            )}

            {step === 'success' && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="font-serif text-2xl mb-2">Pedido Confirmado!</h2>
                  <p className="text-muted-foreground mb-6">
                    Obrigado por comprar na Jangalo Kids! Você receberá atualizações pelo WhatsApp.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Número do pedido: <span className="font-mono font-medium">{orderId?.slice(0, 8)}</span>
                  </p>
                  <Button onClick={() => navigate('/')}>Voltar para a Loja</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Order summary */}
          {step !== 'success' && (
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Tam: {item.size} | Qtd: {item.quantity}
                        </p>
                        <p className="text-sm font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="bg-olive-light/50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <Leaf className="h-4 w-4 text-olive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-olive">Produção sob encomenda</p>
                        <p className="text-xs text-muted-foreground">
                          Envio: {format(estimatedShipDate, "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-sm text-muted-foreground">A calcular</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-serif text-xl font-bold">{formatPrice(subtotal)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
