import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Loader2, Save, TestTube, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettingsData {
  whatsapp_number: string;
  whatsapp_api_type: string;
  whatsapp_instance_id: string;
  whatsapp_token: string;
  whatsapp_api_url: string;
  notify_low_stock: boolean;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsData>({
    whatsapp_number: '',
    whatsapp_api_type: 'z-api',
    whatsapp_instance_id: '',
    whatsapp_token: '',
    whatsapp_api_url: '',
    notify_low_stock: true,
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        whatsapp_number: data.whatsapp_number || '',
        whatsapp_api_type: data.whatsapp_api_type || 'z-api',
        whatsapp_instance_id: data.whatsapp_instance_id || '',
        whatsapp_token: data.whatsapp_token || '',
        whatsapp_api_url: data.whatsapp_api_url || '',
        notify_low_stock: data.notify_low_stock ?? true,
      });
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    const { error } = await supabase.from('notification_settings').upsert({
      user_id: user.id,
      ...settings,
    }, {
      onConflict: 'user_id',
    });

    if (error) {
      toast.error('Erro ao salvar: ' + error.message);
    } else {
      toast.success('Configurações salvas!');
    }

    setIsSaving(false);
  };

  const handleTestNotification = async () => {
    setIsTesting(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-stock-alerts');

      if (error) {
        toast.error('Erro ao testar: ' + error.message);
      } else {
        toast.success(`Teste concluído! ${data.alerts_sent || 0} alertas verificados.`);
        console.log('Test result:', data);
      }
    } catch (err) {
      toast.error('Erro ao executar teste');
      console.error(err);
    }

    setIsTesting(false);
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
          <Bell className="w-5 h-5" />
          Notificações WhatsApp
        </CardTitle>
        <CardDescription>
          Configure as notificações de estoque baixo via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Switch
            id="notify"
            checked={settings.notify_low_stock}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, notify_low_stock: checked }))
            }
          />
          <Label htmlFor="notify" className="font-medium">
            Receber alertas de estoque baixo
          </Label>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Seu número WhatsApp</Label>
            <Input
              placeholder="5511999999999"
              value={settings.whatsapp_number}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, whatsapp_number: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Formato: código do país + DDD + número (sem espaços ou traços)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Serviço de API</Label>
            <Select
              value={settings.whatsapp_api_type}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, whatsapp_api_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="z-api">Z-API</SelectItem>
                <SelectItem value="evolution">Evolution API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.whatsapp_api_type === 'z-api' && (
            <>
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <p className="text-sm font-medium text-blue-800">Como configurar a Z-API:</p>
                <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                  <li>Acesse <a href="https://z-api.io" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">z-api.io <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Crie uma conta e uma nova instância</li>
                  <li>Conecte seu WhatsApp escaneando o QR Code</li>
                  <li>Copie o Instance ID e Token abaixo</li>
                </ol>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instance ID</Label>
                  <Input
                    placeholder="Seu Instance ID"
                    value={settings.whatsapp_instance_id}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, whatsapp_instance_id: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Token</Label>
                  <Input
                    type="password"
                    placeholder="Seu Token"
                    value={settings.whatsapp_token}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, whatsapp_token: e.target.value }))
                    }
                  />
                </div>
              </div>
            </>
          )}

          {settings.whatsapp_api_type === 'evolution' && (
            <>
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <p className="text-sm font-medium text-green-800">Como configurar a Evolution API:</p>
                <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
                  <li>Configure sua instância Evolution API</li>
                  <li>Conecte seu WhatsApp</li>
                  <li>Copie a URL da API, Instance ID e API Key abaixo</li>
                </ol>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>URL da API</Label>
                  <Input
                    placeholder="https://sua-api.com"
                    value={settings.whatsapp_api_url}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, whatsapp_api_url: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instance ID</Label>
                    <Input
                      placeholder="Nome da instância"
                      value={settings.whatsapp_instance_id}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, whatsapp_instance_id: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="Sua API Key"
                      value={settings.whatsapp_token}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, whatsapp_token: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
          <Button variant="outline" onClick={handleTestNotification} disabled={isTesting}>
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4 mr-2" />
            )}
            Testar Alertas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};