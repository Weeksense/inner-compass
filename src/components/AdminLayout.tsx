import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, FileText, Settings, LogOut, ChevronLeft, Target } from 'lucide-react';
import WeekSenseLogo from '@/components/WeekSenseLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reviews', icon: FileText, label: 'Reviews' },
  { to: '/admin/goals', icon: Target, label: 'Goals' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Red/orange admin border */}
      <div className="h-0.5 bg-gradient-to-r from-destructive via-primary to-primary" />

      {/* Top navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-serif text-lg">
              <span className="text-foreground">Week</span>
              <span className="text-primary">Sense</span>
              <span className="text-muted-foreground ml-2 text-sm font-sans">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to App
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border/50 min-h-[calc(100vh-3.625rem)] p-4 hidden md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden border-b border-border/50 w-full fixed top-[3.625rem] bg-background/80 backdrop-blur-xl z-40">
          <div className="flex gap-1 px-4 py-2 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                  }`
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 md:pt-8 pt-16 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
