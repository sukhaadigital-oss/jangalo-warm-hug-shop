import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LowStockItem {
  product_id: string
  product_name: string
  size: string
  quantity: number
  min_stock_alert: number
}

interface NotificationSettings {
  user_id: string
  whatsapp_number: string
  whatsapp_api_type: string
  whatsapp_instance_id: string
  whatsapp_token: string
  whatsapp_api_url: string
  notify_low_stock: boolean
}

async function sendZApiMessage(settings: NotificationSettings, message: string) {
  const url = `https://api.z-api.io/instances/${settings.whatsapp_instance_id}/token/${settings.whatsapp_token}/send-text`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: settings.whatsapp_number.replace(/\D/g, ''),
      message: message,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Z-API error: ${error}`)
  }
  
  return response.json()
}

async function sendEvolutionMessage(settings: NotificationSettings, message: string) {
  const url = `${settings.whatsapp_api_url}/message/sendText/${settings.whatsapp_instance_id}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': settings.whatsapp_token,
    },
    body: JSON.stringify({
      number: settings.whatsapp_number.replace(/\D/g, ''),
      text: message,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Evolution API error: ${error}`)
  }
  
  return response.json()
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find products with low stock
    const { data: lowStockItems, error: stockError } = await supabase
      .from('product_stock')
      .select(`
        product_id,
        size,
        quantity,
        min_stock_alert,
        products!inner(name)
      `)
      .lte('quantity', 3) // Check items with 3 or less

    if (stockError) {
      console.error('Error fetching low stock items:', stockError)
      throw stockError
    }

    if (!lowStockItems || lowStockItems.length === 0) {
      console.log('No low stock items found')
      return new Response(
        JSON.stringify({ message: 'No low stock alerts needed', items: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter items that are at or below their individual min_stock_alert
    const alertItems: LowStockItem[] = lowStockItems
      .filter((item: any) => item.quantity <= item.min_stock_alert)
      .map((item: any) => ({
        product_id: item.product_id,
        product_name: item.products.name,
        size: item.size,
        quantity: item.quantity,
        min_stock_alert: item.min_stock_alert,
      }))

    if (alertItems.length === 0) {
      console.log('No items below their alert threshold')
      return new Response(
        JSON.stringify({ message: 'No alerts needed', items: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for recent alerts to avoid spamming (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentAlerts } = await supabase
      .from('stock_alert_logs')
      .select('product_id, size')
      .gte('notification_sent_at', yesterday.toISOString())

    const recentAlertKeys = new Set(
      recentAlerts?.map(a => `${a.product_id}-${a.size}`) || []
    )

    const newAlerts = alertItems.filter(
      item => !recentAlertKeys.has(`${item.product_id}-${item.size}`)
    )

    if (newAlerts.length === 0) {
      console.log('All low stock items already alerted in last 24h')
      return new Response(
        JSON.stringify({ message: 'Already alerted recently', items: alertItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all admin notification settings
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    if (!adminRoles || adminRoles.length === 0) {
      console.log('No admin users found')
      return new Response(
        JSON.stringify({ message: 'No admins to notify', items: newAlerts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminUserIds = adminRoles.map(r => r.user_id)

    const { data: notificationSettings } = await supabase
      .from('notification_settings')
      .select('*')
      .in('user_id', adminUserIds)
      .eq('notify_low_stock', true)

    if (!notificationSettings || notificationSettings.length === 0) {
      console.log('No notification settings configured for admins')
      return new Response(
        JSON.stringify({ message: 'No notification settings', items: newAlerts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build alert message
    const message = `🚨 *ALERTA DE ESTOQUE BAIXO - Jangalô*\n\n` +
      newAlerts.map(item => 
        `📦 *${item.product_name}*\n   Tamanho: ${item.size}\n   Quantidade: ${item.quantity} unidades`
      ).join('\n\n') +
      `\n\n⚠️ Reabasteça o estoque para evitar perda de vendas!`

    // Send notifications
    const results = []
    for (const settings of notificationSettings) {
      try {
        if (!settings.whatsapp_number || !settings.whatsapp_instance_id || !settings.whatsapp_token) {
          console.log(`Incomplete settings for user ${settings.user_id}`)
          continue
        }

        if (settings.whatsapp_api_type === 'z-api') {
          await sendZApiMessage(settings as NotificationSettings, message)
        } else if (settings.whatsapp_api_type === 'evolution') {
          await sendEvolutionMessage(settings as NotificationSettings, message)
        }

        results.push({ user_id: settings.user_id, success: true })
        console.log(`Notification sent to user ${settings.user_id}`)
      } catch (error) {
        console.error(`Failed to send to user ${settings.user_id}:`, error)
        results.push({ user_id: settings.user_id, success: false, error: String(error) })
      }
    }

    // Log the alerts
    for (const item of newAlerts) {
      await supabase.from('stock_alert_logs').insert({
        product_id: item.product_id,
        size: item.size,
        quantity_at_alert: item.quantity,
        notification_type: 'whatsapp',
      })
    }

    return new Response(
      JSON.stringify({
        message: 'Stock check completed',
        alerts_sent: newAlerts.length,
        items: newAlerts,
        notification_results: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in check-stock-alerts:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})