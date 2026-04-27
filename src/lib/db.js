/**
 * db.js — Drop-in replacement for the Base44 SDK
 * Uses Supabase under the hood.
 * 
 * Usage (same as before):
 *   import { db } from '@/lib/db';
 *   db.entities.Vehicle.list(...)
 *   db.auth.me()
 *   db.integrations.Core.UploadFile(...)
 */

import { supabase } from './supabase';

// ─── Auth ─────────────────────────────────────────────────────────────────────

const auth = {
  /** Returns the logged-in user or throws if not authenticated */
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw Object.assign(new Error('Not authenticated'), { status: 401 });
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
    };
  },

  isAuthenticated: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  },

  /** Redirects to Supabase OAuth login (Google). returnUrl is where to come back after. */
  redirectToLogin: (returnUrl = window.location.href) => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: returnUrl },
    });
  },

  logout: async (redirectTo = '/') => {
    await supabase.auth.signOut();
    window.location.href = redirectTo;
  },
};

// ─── Entity factory ───────────────────────────────────────────────────────────

/**
 * Creates a CRUD interface for a Supabase table.
 * Mimics the Base44 entity API:
 *   .list(order, limit)
 *   .filter(filters, order, limit)
 *   .get(id)
 *   .create(data)
 *   .update(id, data)
 *   .delete(id)
 */
function makeEntity(tableName) {
  return {
    /**
     * List all records.
     * @param {string} order  e.g. '-created_date' (minus = descending) or 'price'
     * @param {number} limit
     */
    list: async (order = '-created_date', limit = 500) => {
      const { column, ascending } = parseOrder(order);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(column, { ascending })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    /**
     * Filter records by exact field matches.
     * @param {object} filters  e.g. { created_by: 'user@email.com' }
     * @param {string} order
     * @param {number} limit
     */
    filter: async (filters = {}, order = '-created_date', limit = 100) => {
      const { column, ascending } = parseOrder(order);
      let query = supabase.from(tableName).select('*');
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
      const { data, error } = await query.order(column, { ascending }).limit(limit);
      if (error) throw error;
      return data;
    },

    /** Get a single record by id */
    get: async (id) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    /** Create a new record. Automatically adds created_by from logged-in user. */
    create: async (payload) => {
      const { data: { user } } = await supabase.auth.getUser();
      const row = {
        ...payload,
        created_by: user?.email || null,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from(tableName)
        .insert([row])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /** Update a record by id */
    update: async (id, payload) => {
      const { data, error } = await supabase
        .from(tableName)
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /** Delete a record by id */
    delete: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
  };
}

// ─── File upload ──────────────────────────────────────────────────────────────

const integrations = {
  Core: {
    /**
     * Upload a file to Supabase Storage.
     * Returns { file_url } to match the Base44 API.
     * 
     * Make sure you have a public bucket called "uploads" in your Supabase project.
     * (Storage → New bucket → name: "uploads" → Public: ON)
     */
    UploadFile: async ({ file }) => {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      return { file_url: publicUrl };
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseOrder(order = 'created_date') {
  if (order.startsWith('-')) {
    return { column: order.slice(1), ascending: false };
  }
  return { column: order, ascending: true };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const db = {
  auth,
  entities: {
    Vehicle: makeEntity('vehicles'),
  },
  integrations,
};

export default db;
