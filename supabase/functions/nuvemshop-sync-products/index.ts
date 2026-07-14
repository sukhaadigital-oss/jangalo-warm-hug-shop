import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NUVEMSHOP_USER_AGENT = 'Jangalo Vitrine Sync (lucasforf01@gmail.com)'
const API_VERSION = '2025-03'

function pickLocalized(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const obj = value as Record<string, string>
    return obj.pt || obj.pt_BR || obj.es || Object.values(obj)[0] || ''
  }
  return ''
}

const HTML_ENTITIES: Record<string, string> = {
  aacute: 'á', Aacute: 'Á', eacute: 'é', Eacute: 'É', iacute: 'í', Iacute: 'Í',
  oacute: 'ó', Oacute: 'Ó', uacute: 'ú', Uacute: 'Ú', atilde: 'ã', Atilde: 'Ã',
  otilde: 'õ', Otilde: 'Õ', ccedil: 'ç', Ccedil: 'Ç', acirc: 'â', Acirc: 'Â',
  ecirc: 'ê', Ecirc: 'Ê', ocirc: 'ô', Ocirc: 'Ô', agrave: 'à', Agrave: 'À',
  uuml: 'ü', euml: 'ë', nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => HTML_ENTITIES[name] ?? match)
}

function stripHtml(html: string): string {
  const withoutTags = html
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')

  return decodeHtmlEntities(withoutTags)
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

async function isCallerAuthorized(req: Request, serviceClient: ReturnType<typeof createClient>): Promise<boolean> {
  const cronSecret = req.headers.get('x-cron-secret')
  if (cronSecret && cronSecret === Deno.env.get('CRON_SECRET')) return true

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return false

  try {
    const anonClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await anonClient.auth.getUser(token)
    if (userError || !userData.user) return false

    const { data, error } = await serviceClient.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' })
    if (error) {
      console.error('has_role check failed:', error)
      return false
    }
    return data === true
  } catch (error) {
    console.error('Failed to authorize caller:', error)
    return false
  }
}

async function fetchAllProducts(storeId: string, accessToken: string) {
  const products: any[] = []
  let page = 1
  const perPage = 200

  while (true) {
    const response = await fetch(
      `https://api.nuvemshop.com.br/${API_VERSION}/${storeId}/products?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': NUVEMSHOP_USER_AGENT,
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Nuvemshop API error (page ${page}): ${response.status} ${text}`)
    }

    const batch = await response.json()
    products.push(...batch)

    if (batch.length < perPage) break
    page += 1
    await new Promise((resolve) => setTimeout(resolve, 550)) // stay under the 2 req/s rate limit
  }

  return products
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const authorized = await isCallerAuthorized(req, supabase)
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let integrationId: string | null = null

  try {
    const { data: integration, error: integrationError } = await supabase
      .from('nuvemshop_integration')
      .select('*')
      .order('connected_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (integrationError) throw integrationError
    if (!integration) {
      return new Response(JSON.stringify({ error: 'Nuvemshop store not connected yet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    integrationId = integration.id

    const nuvemshopProducts = await fetchAllProducts(integration.store_id, integration.access_token)

    const productRecords = nuvemshopProducts.map((p) => {
      const firstVariant = p.variants?.[0]
      const rawPrice = parseFloat(firstVariant?.price ?? '0') || 0
      const promoPrice = firstVariant?.promotional_price ? parseFloat(firstVariant.promotional_price) : null
      const inStock = (p.variants || []).some((v: any) => v.stock === null || (v.stock ?? 0) > 0)

      return {
        nuvemshop_product_id: p.id,
        name: decodeHtmlEntities(pickLocalized(p.name)) || 'Produto sem nome',
        description: stripHtml(pickLocalized(p.description)) || null,
        price: promoPrice && promoPrice > 0 ? promoPrice : rawPrice,
        original_price: promoPrice && promoPrice > 0 ? rawPrice : null,
        category: decodeHtmlEntities(pickLocalized(p.categories?.[0]?.name)) || 'Geral',
        image_url: p.images?.[0]?.src || null,
        in_stock: inStock,
      }
    })

    let syncedProducts = 0
    let syncedVariants = 0

    for (const record of productRecords) {
      const { data: upserted, error: upsertError } = await supabase
        .from('products')
        .upsert(record, { onConflict: 'nuvemshop_product_id' })
        .select('id')
        .single()

      if (upsertError) {
        console.error('Failed to upsert product', record.nuvemshop_product_id, upsertError)
        continue
      }
      syncedProducts += 1

      const sourceProduct = nuvemshopProducts.find((p) => p.id === record.nuvemshop_product_id)
      const variants = sourceProduct?.variants || []

      for (const variant of variants) {
        const size = pickLocalized(variant.values?.[0]) || 'Único'
        const quantity = variant.stock === null || variant.stock === undefined ? 999 : variant.stock

        const { error: stockError } = await supabase
          .from('product_stock')
          .upsert(
            {
              product_id: upserted.id,
              nuvemshop_variant_id: variant.id,
              size,
              quantity,
            },
            { onConflict: 'nuvemshop_variant_id' }
          )

        if (stockError) {
          console.error('Failed to upsert stock', variant.id, stockError)
          continue
        }
        syncedVariants += 1
      }
    }

    await supabase
      .from('nuvemshop_integration')
      .update({ last_synced_at: new Date().toISOString(), last_sync_status: 'success', last_sync_error: null })
      .eq('id', integrationId)

    return new Response(
      JSON.stringify({ message: 'Sync completed', products: syncedProducts, variants: syncedVariants }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in nuvemshop-sync-products:', error)

    if (integrationId) {
      await supabase
        .from('nuvemshop_integration')
        .update({ last_sync_status: 'error', last_sync_error: String(error) })
        .eq('id', integrationId)
    }

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
