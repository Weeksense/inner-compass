import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useIsAdmin = () => {
  const { session } = useAuth();
  const role = session?.user?.app_metadata?.role;
  return role === 'admin';
};

export const useAdminAction = () => {
  return useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('admin-actions', {
      body: { action, ...params },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);
};
