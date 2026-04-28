import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    const APP_URL = Deno.env.get('APP_URL') // ex: https://buscaturbo.pages.dev
    if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado')

    // Verificar autenticação do usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Não autenticado')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Usuário não autenticado')

    const { vehicle_id, plan_id, installments } = await req.json()
    if (!vehicle_id || !plan_id) throw new Error('Dados incompletos')

    // Definir os planos
    const PLANS: Record<string, { title: string; price: number; days: number }> = {
      busca:        { title: 'Destaque na Busca — 7 dias',       price: 29.90, days: 7  },
      home_busca_7: { title: 'Destaque Home + Busca — 7 dias',   price: 49.90, days: 7  },
      home_busca_15:{ title: 'Destaque Premium — 15 dias',       price: 69.90, days: 15 },
    }

    const plan = PLANS[plan_id]
    if (!plan) throw new Error('Plano inválido')

    // Calcular valor com parcelamento (juros a partir de 3x)
    let finalPrice = plan.price
    const numInstallments = parseInt(installments) || 1
    if (numInstallments > 2) {
      finalPrice = plan.price * Math.pow(1 + 0.0299, numInstallments - 2)
    }

    // Criar preferência no Mercado Pago
    const preference = {
      items: [{
        id: `${plan_id}_${vehicle_id}`,
        title: plan.title,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: parseFloat(finalPrice.toFixed(2)),
      }],
      payer: {
        email: user.email,
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: numInstallments,
        default_installments: numInstallments,
      },
      back_urls: {
        success: `${APP_URL}/DestacarAnuncio?status=success&vehicle_id=${vehicle_id}`,
        failure: `${APP_URL}/DestacarAnuncio?status=failure&vehicle_id=${vehicle_id}`,
        pending: `${APP_URL}/DestacarAnuncio?status=pending&vehicle_id=${vehicle_id}`,
      },
      auto_return: 'approved',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
      external_reference: JSON.stringify({
        vehicle_id,
        plan_id,
        user_id: user.id,
        days: plan.days,
      }),
      statement_descriptor: 'BUSCATURBO',
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const err = await mpRes.text()
      throw new Error(`Erro Mercado Pago: ${err}`)
    }

    const mpData = await mpRes.json()

    return new Response(JSON.stringify({
      preference_id: mpData.id,
      init_point: mpData.init_point,        // URL de pagamento (produção)
      sandbox_init_point: mpData.sandbox_init_point, // URL de pagamento (sandbox)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
