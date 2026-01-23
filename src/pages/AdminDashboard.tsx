import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';

const CATEGORIES = [
  { value: 'novidades', label: 'Novidades' },
  { value: 'menina', label: 'Menina' },
  { value: 'menino', label: 'Menino' },
  { value: 'bebe', label: 'Bebê' },
  { value: 'essenciais', label: 'Essenciais' },
  { value: 'sale', label: 'Promoção' },
];

const SIZES = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6', '8', '10', '12'];

const AdminDashboard = () => {
  const { products, addProduct, updateProduct, deleteProduct, isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    category: 'novidades' as Product['category'],
    sizes: [] as string[],
    images: [''],
    productionDays: '3',
    stock: '10',
    isNew: false,
    isSale: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      description: '',
      category: 'novidades',
      sizes: [],
      images: [''],
      productionDays: '3',
      stock: '10',
      isNew: false,
      isSale: false,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description,
      category: product.category,
      sizes: product.sizes,
      images: product.images.length > 0 ? product.images : [''],
      productionDays: product.productionDays.toString(),
      stock: product.stock.toString(),
      isNew: product.isNew || false,
      isSale: product.isSale || false,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || `product-${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description,
      category: formData.category,
      sizes: formData.sizes,
      images: formData.images.filter(img => img.trim() !== ''),
      productionDays: parseInt(formData.productionDays) || 3,
      stock: parseInt(formData.stock) || 0,
      isNew: formData.isNew,
      isSale: formData.isSale,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Produto atualizado com sucesso!');
    } else {
      addProduct(productData);
      toast.success('Produto adicionado com sucesso!');
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast.success('Produto removido com sucesso!');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const lowStockProducts = products.filter(p => p.stock <= 3 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl">Jangalo Kids - Admin</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {products.filter(p => p.stock > 3).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Estoque Baixo
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {lowStockProducts.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Esgotados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {outOfStockProducts.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do produto
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do produto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Product['category'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                        placeholder="0.00 (para promoções)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Estoque (tecido disponível)</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productionDays">Dias para Produção</Label>
                      <Input
                        id="productionDays"
                        type="number"
                        value={formData.productionDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, productionDays: e.target.value }))}
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanhos Disponíveis</Label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(size => (
                        <Button
                          key={size}
                          type="button"
                          variant={formData.sizes.includes(size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do produto"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">URL da Imagem</Label>
                    <Input
                      id="images"
                      value={formData.images[0]}
                      onChange={(e) => setFormData(prev => ({ ...prev, images: [e.target.value] }))}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Marcar como Novidade</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSale}
                        onChange={(e) => setFormData(prev => ({ ...prev, isSale: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Marcar como Promoção</span>
                    </label>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSubmit}>
                    {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Produção</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <span className={
                        product.stock === 0 ? 'text-red-600 font-medium' :
                        product.stock <= 3 ? 'text-yellow-600 font-medium' :
                        'text-green-600'
                      }>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.productionDays} dias</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.isNew && <Badge className="bg-primary">Novo</Badge>}
                        {product.isSale && <Badge variant="destructive">Promo</Badge>}
                        {product.stock === 0 && <Badge variant="outline">Esgotado</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar Produto</DialogTitle>
                              <DialogDescription>
                                Atualize os dados do produto
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nome *</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nome do produto"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category">Categoria *</Label>
                                  <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Product['category'] }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                          {cat.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-price">Preço (R$) *</Label>
                                  <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="0.00"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-originalPrice">Preço Original (R$)</Label>
                                  <Input
                                    id="edit-originalPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                                    placeholder="0.00 (para promoções)"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-stock">Estoque</Label>
                                  <Input
                                    id="edit-stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                    placeholder="10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-productionDays">Dias para Produção</Label>
                                  <Input
                                    id="edit-productionDays"
                                    type="number"
                                    value={formData.productionDays}
                                    onChange={(e) => setFormData(prev => ({ ...prev, productionDays: e.target.value }))}
                                    placeholder="3"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Tamanhos Disponíveis</Label>
                                <div className="flex flex-wrap gap-2">
                                  {SIZES.map(size => (
                                    <Button
                                      key={size}
                                      type="button"
                                      variant={formData.sizes.includes(size) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => toggleSize(size)}
                                    >
                                      {size}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Descrição *</Label>
                                <Textarea
                                  id="edit-description"
                                  value={formData.description}
                                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Descrição do produto"
                                  rows={3}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-images">URL da Imagem</Label>
                                <Input
                                  id="edit-images"
                                  value={formData.images[0]}
                                  onChange={(e) => setFormData(prev => ({ ...prev, images: [e.target.value] }))}
                                  placeholder="https://exemplo.com/imagem.jpg"
                                />
                              </div>

                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.isNew}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Marcar como Novidade</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.isSale}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isSale: e.target.checked }))}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Marcar como Promoção</span>
                                </label>
                              </div>
                            </div>

                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <Button onClick={handleSubmit}>
                                Salvar Alterações
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
