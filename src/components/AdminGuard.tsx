import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();
  const isAdmin = useIsAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
