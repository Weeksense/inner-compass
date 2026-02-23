import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Redirects to onboarding if no profile exists, otherwise renders children.
 */
const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user && !profile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;
