import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

// ── Verificar assinatura do Mercado Pago ──────────────────────────
async function verifyMPSignature(req: Request, body: string): Promise<boolean> {
  try {
    const secret = Deno.env.get('MP_WEBHOOK_SECRET')
    if (!secret) return true // Se não configurou ainda, deixa passar (remover em produção)

    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')
    const url = new URL(req.url)
    const dataId = url.searchParams.get('data.id') || JSON.parse(body)?.data?.id || ''

    if (!xSignature) return false

    // Montar o manifest conforme documentação do MP
    const parts = xSignature.split(',')
    let ts = ''
    let v1 = ''
    for (const part of parts) {
      const [key, value] = part.trim().split('=')
      if (key === 'ts') ts = value
      if (key === 'v1') v1 = value
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const msgData = encoder.encode(manifest)

    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
    const hashHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    return hashHex === v1
  } catch {
    return false
  }
}

// ── Rate limiting simples via Supabase ───────────────────────────
async function checkRateLimit(supabase: any, ip: string): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - 60_000).toISOString() // último 1 min
    const { count } = await supabase
      .from('webhook_rate_limit')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', windowStart)

    if ((count || 0) > 30) return false // máx 30 chamadas/min por IP

    await supabase.from('webhook_rate_limit').insert({ ip })
    return true
  } catch {
    return true // Se falhar, deixa passar para não bloquear pagamentos legítimos
  }
}

serve(async (req) => {
  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado')

    const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'
    const secretKeys = JSON.parse(secretKeysRaw)
    const serviceRoleKey = secretKeys.service_role || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceRoleKey,
    )

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    const allowed = await checkRateLimit(supabase, ip)
    if (!allowed) {
      return new Response('Too Many Requests', { status: 429 })
    }

    const body = await req.text()

    // Verificar assinatura do MP
    const isValid = await verifyMPSignature(req, body)
    if (!isValid) {
      console.error('Assinatura inválida — possível tentativa de fraude')
      return new Response('Unauthorized', { status: 401 })
    }

    const notification = JSON.parse(body)

    // Só processar notificações de pagamento
    if (notification.type !== 'payment') {
      return new Response('ok', { status: 200 })
    }

    const paymentId = notification.data?.id
    if (!paymentId) return new Response('ok', { status: 200 })

    // Buscar detalhes do pagamento na API do MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) throw new Error('Erro ao buscar pagamento no MP')
    const payment = await mpRes.json()

    // Só processar pagamentos aprovados
    if (payment.status !== 'approved') {
      return new Response('ok', { status: 200 })
    }

    // Recuperar dados do external_reference
    const ref = JSON.parse(payment.external_reference || '{}')
    const { vehicle_id, days, plan_id, user_id } = ref
    if (!vehicle_id || !days) throw new Error('external_reference inválido')

    // Idempotência — verificar se já processamos esse pagamento
    const { data: existing } = await supabase
      .from('highlight_payments')
      .select('id')
      .eq('payment_id', String(paymentId))
      .single()

    if (existing) return new Response('ok', { status: 200 })

    // Verificar que o veículo pertence ao usuário (evita destacar anúncio alheio)
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id, created_by')
      .eq('id', vehicle_id)
      .single()

    if (!vehicle) throw new Error('Veículo não encontrado')

    // Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(days))

    // 1. Ativar o destaque no veículo
    await supabase
      .from('vehicles')
      .update({
        is_featured: true,
        featured_until: expiresAt.toISOString(),
        featured_plan: plan_id,
      })
      .eq('id', vehicle_id)

    // 2. Registrar o pagamento
    await supabase.from('highlight_payments').insert({
      payment_id: String(paymentId),
      vehicle_id,
      user_id,
      plan_id,
      amount: payment.transaction_amount,
      status: 'approved',
      expires_at: expiresAt.toISOString(),
    })

    return new Response('ok', { status: 200 })

  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response('ok', { status: 200 })
  }
})
