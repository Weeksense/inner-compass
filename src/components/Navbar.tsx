import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="font-serif text-xl text-foreground hover:text-primary transition-colors">
          WeeklyReview
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-8 h-8">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile?.name || ''} />}
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.name || user?.email}
            </span>
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
