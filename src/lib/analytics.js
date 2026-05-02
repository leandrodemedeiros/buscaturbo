/**
 * analytics.js — Registro de eventos para o Dashboard
 * Chamado nas páginas relevantes para capturar métricas
 */
import { supabase } from './supabase';

async function log(event_type, extra = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date();
    await supabase.from('access_logs').insert({
      event_type,
      user_email: user?.email || null,
      hour_of_day: now.getHours(),
      day_of_week: now.getDay(),
      created_at: now.toISOString(),
      ...extra,
    });
  } catch { /* silently fail — never break the user experience */ }
}

export const analytics = {
  /** Registra visualização de página genérica */
  pageView: (page) => log('page_view', { page }),

  /** Registra visualização de um anúncio específico */
  vehicleView: (vehicleId, brand) => log('vehicle_view', { vehicle_id: vehicleId, brand, page: 'vehicle_detail' }),

  /** Registra uma busca com termo/marca */
  search: (searchTerm, brand) => log('search', { search_term: searchTerm || null, brand: brand || null, page: 'search' }),

  /** Registra clique em contato/detalhes de um anúncio */
  contactClick: (vehicleId, brand) => log('contact_click', { vehicle_id: vehicleId, brand, page: 'vehicle_detail' }),
};
