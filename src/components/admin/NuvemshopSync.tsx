import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, CheckCircle2, XCircle, CloudOff } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationData {
  store_id: string;
  connected_at: string;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
}

export const NuvemshopSync = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [integration, setIntegration] = useState<IntegrationData | null>(null);

  const fetchIntegration = async () => {
    const { data, error } = await supabase
      .from('nuvemshop_integration')
      .select('store_id, connected_at, last_synced_at, last_sync_status, last_sync_error')
      .order('connected_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      setIntegration(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIntegration();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const { data, error } = await supabase.functions.invoke('nuvemshop-sync-products');

      if (error) {
        toast.error('Erro ao sincronizar: ' + error.message);
      } else {
        toast.success(`Sincronizado! ${data.products} produtos, ${data.variants} variações.`);
      }
    } catch (err) {
      toast.error('Erro ao executar sincronização');
      console.error(err);
    }

    await fetchIntegration();
    setIsSyncing(false);
  };

  const formatDate = (value: string | null) => {
    if (!value) return 'Nunca';
    return new Date(value).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Sincronização Nuvemshop
        </CardTitle>
        <CardDescription>
          Produtos e estoque são importados automaticamente da sua loja Nuvemshop a cada 3 horas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!integration ? (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg text-muted-foreground">
            <CloudOff className="w-5 h-5" />
            <p>Nenhuma loja Nuvemshop conectada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Loja conectada</p>
              <p className="font-medium">ID {integration.store_id}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Última sincronização</p>
              <p className="font-medium">{formatDate(integration.last_synced_at)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              {integration.last_sync_status === 'success' && (
                <Badge className="bg-green-600 flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3 h-3" /> Sucesso
                </Badge>
              )}
              {integration.last_sync_status === 'error' && (
                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                  <XCircle className="w-3 h-3" /> Erro
                </Badge>
              )}
              {!integration.last_sync_status && (
                <Badge variant="outline">Ainda não sincronizado</Badge>
              )}
            </div>
          </div>
        )}

        {integration?.last_sync_error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg">
            {integration.last_sync_error}
          </div>
        )}

        <Button onClick={handleSync} disabled={isSyncing || !integration}>
          {isSyncing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sincronizar agora
        </Button>
      </CardContent>
    </Card>
  );
};
