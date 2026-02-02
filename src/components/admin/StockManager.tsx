import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Package, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface StockItem {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  min_stock_alert: number;
}

interface Product {
  id: string;
  name: string;
}

const SIZES = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6', '8', '10', '12', '14'];

export const StockManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [newSize, setNewSize] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('0');
  const [newMinAlert, setNewMinAlert] = useState<string>('3');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [productsRes, stockRes] = await Promise.all([
      supabase.from('products').select('id, name').order('name'),
      supabase.from('product_stock').select('*').order('size'),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (stockRes.data) setStockItems(stockRes.data);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStock = async () => {
    if (!selectedProduct || !newSize) {
      toast.error('Selecione o produto e o tamanho');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('product_stock').upsert({
      product_id: selectedProduct,
      size: newSize,
      quantity: parseInt(newQuantity) || 0,
      min_stock_alert: parseInt(newMinAlert) || 3,
    }, {
      onConflict: 'product_id,size',
    });

    if (error) {
      toast.error('Erro ao salvar estoque: ' + error.message);
    } else {
      toast.success('Estoque atualizado!');
      setIsDialogOpen(false);
      setSelectedProduct('');
      setNewSize('');
      setNewQuantity('0');
      setNewMinAlert('3');
      fetchData();
    }

    setIsSubmitting(false);
  };

  const handleUpdateQuantity = async (item: StockItem, newQty: number) => {
    const { error } = await supabase
      .from('product_stock')
      .update({ quantity: newQty })
      .eq('id', item.id);

    if (error) {
      toast.error('Erro ao atualizar');
    } else {
      setStockItems(prev => 
        prev.map(s => s.id === item.id ? { ...s, quantity: newQty } : s)
      );
    }
  };

  const handleDeleteStock = async (id: string) => {
    const { error } = await supabase.from('product_stock').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao remover');
    } else {
      toast.success('Removido!');
      setStockItems(prev => prev.filter(s => s.id !== id));
    }
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produto desconhecido';
  };

  const groupedByProduct = stockItems.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = [];
    }
    acc[item.product_id].push(item);
    return acc;
  }, {} as Record<string, StockItem[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Controle de Estoque por Tamanho
        </CardTitle>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Estoque
        </Button>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedByProduct).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum estoque cadastrado</p>
            <p className="text-sm">Adicione o estoque por tamanho para cada produto</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByProduct).map(([productId, items]) => (
              <div key={productId} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">{getProductName(productId)}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`relative p-3 rounded-lg border ${
                        item.quantity <= item.min_stock_alert
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{item.size}</Badge>
                        {item.quantity <= item.min_stock_alert && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleUpdateQuantity(item, Math.max(0, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteStock(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Estoque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tamanho</Label>
                <Select value={newSize} onValueChange={setNewSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alerta mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newMinAlert}
                    onChange={(e) => setNewMinAlert(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddStock} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};