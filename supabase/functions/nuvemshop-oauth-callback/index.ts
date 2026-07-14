import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function htmlResponse(title: string, message: string, ok: boolean) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;color:#1a1a1a}
.card{background:#fff;padding:32px 40px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);max-width:420px;text-align:center}
h1{font-size:20px;margin:0 0 8px}p{margin:0;color:#555}</style></head>
<body><div class="card"><h1>${ok ? '✅' : '❌'} ${title}</h1><p>${message}</p></div></body></html>`
  return new Response(html, { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return htmlResponse('Erro na conexão', 'Código de autorização ausente. Tente instalar o aplicativo novamente.', false)
  }

  try {
    const clientId = Deno.env.get('NUVEMSHOP_CLIENT_ID')!
    const clientSecret = Deno.env.get('NUVEMSHOP_CLIENT_SECRET')!

    const tokenResponse = await fetch('https://www.nuvemshop.com.br/apps/authorize/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Nuvemshop token exchange failed:', errorText)
      return htmlResponse('Erro na conexão', 'Não foi possível concluir a autorização com a Nuvemshop. Tente novamente.', false)
    }

    const tokenData = await tokenResponse.json()
    const storeId = String(tokenData.user_id ?? tokenData.store_id)
    const accessToken = tokenData.access_token as string
    const scope = tokenData.scope as string | undefined

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('nuvemshop_integration')
      .upsert(
        { store_id: storeId, access_token: accessToken, scope, connected_at: new Date().toISOString() },
        { onConflict: 'store_id' }
      )

    if (error) {
      console.error('Failed to save nuvemshop integration:', error)
      return htmlResponse('Erro na conexão', 'Autorização recebida, mas houve um erro ao salvar a conexão. Contate o suporte técnico.', false)
    }

    return htmlResponse('Loja conectada!', 'Sua loja Nuvemshop foi conectada com sucesso. Você já pode fechar esta aba e voltar ao painel admin.', true)
  } catch (error) {
    console.error('Error in nuvemshop-oauth-callback:', error)
    return htmlResponse('Erro na conexão', 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte técnico.', false)
  }
})
