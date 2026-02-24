import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useAdmin';
import WeekSenseLogo from '@/components/WeekSenseLogo';

const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const check = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();
        if (!error && data) {
          setMaintenance(data.value === 'true');
        }
      } catch {
        // Table may not exist yet — default to no maintenance
      }
      setChecked(true);
    };
    check();
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (maintenance && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <WeekSenseLogo iconSize={48} />
          </div>
          <h1 className="font-serif text-4xl text-foreground mb-4">
            WeekSense is getting better.
          </h1>
          <p className="text-lg text-muted-foreground">Back soon.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
