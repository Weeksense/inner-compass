import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminAction } from '@/hooks/useAdmin';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Shield, FileText, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const adminAction = useAdminAction();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminAction('get_settings');
        const map: Record<string, string> = {};
        data?.forEach((s: any) => { map[s.key] = s.value; });
        setSettings(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSaving(key);
    try {
      await adminAction('update_setting', { key, value });
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast.success(`${key.replace(/_/g, ' ')} updated`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-8">Settings</h1>

      <div className="space-y-6 max-w-xl">
        {/* Maintenance mode */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-foreground font-medium">Maintenance Mode</h3>
                <p className="text-sm text-muted-foreground">Show maintenance page to non-admin users</p>
              </div>
            </div>
            <Switch
              checked={settings.maintenance_mode === 'true'}
              onCheckedChange={(checked) => updateSetting('maintenance_mode', checked ? 'true' : 'false')}
              disabled={saving === 'maintenance_mode'}
            />
          </div>
        </motion.div>

        {/* Free review limit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-foreground font-medium">Free Tier Review Limit</h3>
              <p className="text-sm text-muted-foreground">Max reviews for free users</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={100}
              value={settings.free_review_limit || '3'}
              onChange={(e) => setSettings((prev) => ({ ...prev, free_review_limit: e.target.value }))}
              className="w-24 bg-muted/50 border-border/50"
            />
            <Button
              size="sm"
              onClick={() => updateSetting('free_review_limit', settings.free_review_limit || '3')}
              disabled={saving === 'free_review_limit'}
            >
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
          </div>
        </motion.div>

        {/* Welcome email toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-foreground font-medium">Welcome Email</h3>
                <p className="text-sm text-muted-foreground">Send welcome email to new signups</p>
              </div>
            </div>
            <Switch
              checked={settings.welcome_email_enabled === 'true'}
              onCheckedChange={(checked) => updateSetting('welcome_email_enabled', checked ? 'true' : 'false')}
              disabled={saving === 'welcome_email_enabled'}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
