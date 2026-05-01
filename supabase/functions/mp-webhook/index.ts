import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado')

    // Supabase com service_role para poder escrever sem RLS
    // Suporta tanto a chave nova (SUPABASE_SECRET_KEYS) quanto a legada
    const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'
    const secretKeys = JSON.parse(secretKeysRaw)
    const serviceRoleKey = secretKeys.service_role || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceRoleKey,
    )

    const body = await req.json()

    // MP envia notificações de vários tipos — só nos interessa "payment"
    if (body.type !== 'payment') {
      return new Response('ok', { status: 200 })
    }

    const paymentId = body.data?.id
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
    const { vehicle_id, days } = ref
    if (!vehicle_id || !days) throw new Error('external_reference inválido')

    // Verificar se já processamos esse pagamento (idempotência)
    const { data: existing } = await supabase
      .from('highlight_payments')
      .select('id')
      .eq('payment_id', String(paymentId))
      .single()

    if (existing) return new Response('ok', { status: 200 }) // já processado

    // Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(days))

    // 1. Ativar o destaque no veículo
    await supabase
      .from('vehicles')
      .update({
        is_featured: true,
        featured_until: expiresAt.toISOString(),
        featured_plan: ref.plan_id,
      })
      .eq('id', vehicle_id)

    // 2. Registrar o pagamento
    await supabase.from('highlight_payments').insert({
      payment_id: String(paymentId),
      vehicle_id,
      user_id: ref.user_id,
      plan_id: ref.plan_id,
      amount: payment.transaction_amount,
      status: 'approved',
      expires_at: expiresAt.toISOString(),
    })

    return new Response('ok', { status: 200 })

  } catch (err) {
    console.error('Webhook error:', err.message)
    // Retornar 200 mesmo com erro para o MP não reenviar infinitamente
    return new Response('ok', { status: 200 })
  }
})
