import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('admins')
        .select('is_super')
        .eq('email', user.email)
        .single();

      if (data) {
        setIsAdmin(true);
        setIsSuperAdmin(data.is_super);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, isSuperAdmin, loading };
}
