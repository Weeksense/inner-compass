import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Target, X, Download, Copy, Link, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ShareCardProps {
  open: boolean;
  onClose: () => void;
  reviewId: string;
  weekDate: string;
  wins: string;
  energyScore: number;
  focusItems: string[];
  summary: string;
}

const ShareCard = ({ open, onClose, reviewId, weekDate, wins, energyScore, focusItems, summary }: ShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copyingLink, setCopyingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyAsText = () => {
    const text = `📝 My Weekly Review — ${weekDate}\n\n🏆 Biggest Win: ${wins}\n⚡ Energy: ${energyScore}/10\n\n🎯 Focus for Next Week:\n${focusItems.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nJust did my weekly reflection with WeekSense ✦ weeksense.com`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a14',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `weekly-review-${weekDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image downloaded!');
    } catch {
      toast.error('Could not generate image. Try copying as text instead.');
    }
  };

  const copyPublicLink = async () => {
    setCopyingLink(true);
    try {
      // Check if review already has a share token
      const { data: existing } = await supabase
        .from('reviews')
        .select('share_token')
        .eq('id', reviewId)
        .single();

      let token = existing?.share_token;

      if (!token) {
        // Generate a new token
        token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const { error } = await supabase
          .from('reviews')
          .update({ share_token: token })
          .eq('id', reviewId);
        if (error) throw error;
      }

      const url = `${window.location.origin}/shared/${token}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success('Public link copied!');
      setTimeout(() => setLinkCopied(false), 2500);
    } catch (err) {
      console.error('Failed to generate share link:', err);
      toast.error('Could not generate share link');
    } finally {
      setCopyingLink(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          {/* The shareable card */}
          <div
            ref={cardRef}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(240 15% 8%), hsl(240 20% 5%))',
              border: '1px solid hsl(240 10% 16%)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'hsl(240 5% 55%)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                WeekSense
              </span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: 'hsl(0 0% 95%)', marginBottom: '0.25rem' }}>
              Week of {weekDate}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'hsl(240 5% 55%)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {summary}
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Win */}
              <div style={{
                flex: 1,
                background: 'hsl(240 12% 14%)',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Trophy style={{ width: 16, height: 16, color: 'hsl(36 90% 55%)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'hsl(240 5% 55%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biggest Win</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'hsl(0 0% 90%)', lineHeight: 1.4 }}>
                  {wins || 'No wins recorded'}
                </p>
              </div>

              {/* Energy */}
              <div style={{
                width: '5rem',
                background: 'hsl(240 12% 14%)',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap style={{ width: 16, height: 16, color: 'hsl(36 90% 55%)', marginBottom: '0.25rem' }} />
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: 'hsl(0 0% 95%)' }}>
                  {energyScore}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'hsl(240 5% 55%)' }}>/10</span>
              </div>
            </div>

            {/* Focus Items */}
            <div style={{ background: 'hsl(240 12% 14%)', borderRadius: '0.75rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Target style={{ width: 16, height: 16, color: 'hsl(263 70% 58%)' }} />
                <span style={{ fontSize: '0.7rem', color: 'hsl(240 5% 55%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Next Week's Focus
                </span>
              </div>
              {focusItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: i < focusItems.length - 1 ? '0.5rem' : 0 }}>
                  <span style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    background: 'hsl(36 90% 55% / 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    color: 'hsl(36 90% 55%)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(0 0% 85%)', lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'right' as const }}>
              <span style={{ fontSize: '0.65rem', color: 'hsl(240 5% 40%)', fontStyle: 'italic' }}>
                weeksense.com
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            <Button variant="outline" onClick={copyPublicLink} disabled={copyingLink}>
              {copyingLink ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : linkCopied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Link className="w-4 h-4 mr-2" />
              )}
              {linkCopied ? 'Copied!' : 'Copy Public Link'}
            </Button>
            <Button variant="outline" onClick={copyAsText}>
              <Copy className="w-4 h-4 mr-2" /> Copy as Text
            </Button>
            <Button onClick={downloadAsImage}>
              <Download className="w-4 h-4 mr-2" /> Download Image
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareCard;
