import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import { Camera, Save, Trash2, Calendar, Clock, Globe, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, '0')}:00`;
});

const Profile = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [reviewDay, setReviewDay] = useState(profile?.review_day?.toString() || '0');
  const [reviewTime, setReviewTime] = useState(profile?.review_time || '18:00');
  const [language, setLanguage] = useState(profile?.language || 'en');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ totalReviews: 0, longestStreak: 0, memberSince: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setReviewDay(profile.review_day?.toString() || '0');
      setReviewTime(profile.review_time || '18:00');
      setLanguage(profile.language || 'en');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, created_at')
        .eq('user_id', user.id);
      
      setStats({
        totalReviews: reviews?.length || 0,
        longestStreak: profile?.longest_streak || profile?.streak_count || 0,
        memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
      });
    };
    fetchStats();
  }, [user, profile]);

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(publicUrl);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
      await refreshProfile();
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        name,
        review_day: parseInt(reviewDay),
        review_time: reviewTime,
        language,
      }).eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile saved');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete user data
      await supabase.from('goal_progress').delete().in('goal_id', 
        (await supabase.from('goals').select('id').eq('user_id', user.id)).data?.map(g => g.id) || []
      );
      await supabase.from('goals').delete().eq('user_id', user.id);
      await supabase.from('reviews').delete().eq('user_id', user.id);
      await supabase.from('patterns').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      await signOut();
      toast.success('Account deleted');
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Avatar */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer mb-4" onClick={() => fileRef.current?.click()}>
              <Avatar className="w-24 h-24">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-serif">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-foreground" />
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <h1 className="font-serif text-2xl text-foreground">{name || 'Your Profile'}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          {/* Name */}
          <div className="glass-card p-6 mb-6">
            <label className="text-sm text-muted-foreground mb-2 block">Display Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-muted/50 border-border/50"
            />
          </div>

          {/* Reminder */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg text-foreground">Review Reminder</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">We'll send you an email reminder to do your weekly review.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Day</label>
                <Select value={reviewDay} onValueChange={setReviewDay}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Time</label>
                <Select value={reviewTime} onValueChange={setReviewTime}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg text-foreground">Language</h2>
            </div>
            <div className="flex gap-3">
              {[{ value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' }].map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    language === lang.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg text-foreground">Stats</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Member since', value: stats.memberSince },
                { label: 'Total reviews', value: stats.totalReviews.toString() },
                { label: 'Longest streak', value: `${stats.longestStreak} weeks` },
              ].map(stat => (
                <div key={stat.label} className="bg-muted/30 rounded-xl p-4 text-center">
                  <p className="text-lg font-serif text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <Button onClick={handleSave} className="w-full mb-8" size="lg" disabled={saving}>
            {saving ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Changes</>
            )}
          </Button>

          {/* Danger Zone */}
          <div className="text-center">
            <button
              onClick={() => setDeleteOpen(true)}
              className="text-sm text-destructive/60 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              Delete my account
            </button>
          </div>
        </motion.div>
      </main>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all reviews, and all data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
