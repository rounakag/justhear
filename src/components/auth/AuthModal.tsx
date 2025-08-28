import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { SignUpForm } from "./SignUpForm";
import { LoginForm } from "./LoginForm";

interface AuthModalProps {
  children: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
              <DialogContent 
          className="max-w-md w-full p-0 max-h-[90vh] overflow-hidden flex flex-col"
          aria-describedby="auth-modal-description"
        >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl py-6 px-7 text-center flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-white">
            {mode === 'login' ? '🔐 Welcome Back' : '✨ Create Account'}
          </DialogTitle>
          <DialogDescription id="auth-modal-description" className="text-blue-100 text-sm mt-1">
            {mode === 'login' ? 'Sign in to your anonymous account' : 'Join our anonymous community'}
          </DialogDescription>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {mode === 'login' ? (
            <LoginForm 
              onSuccess={() => setOpen(false)}
              onSwitchToSignup={() => setMode('signup')}
            />
          ) : (
            <SignUpForm 
              onSuccess={() => setOpen(false)}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
