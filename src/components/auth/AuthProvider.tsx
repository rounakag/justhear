import React from 'react';
import { AuthProvider as AuthProviderComponent } from '@/hooks/useAuth.tsx';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviderComponent>
      {children}
    </AuthProviderComponent>
  );
}
