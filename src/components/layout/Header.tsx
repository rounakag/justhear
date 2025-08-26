import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system/components';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth.tsx';
import type { NavLink, AppConfig } from '@/types';

interface HeaderProps {
  navLinks: NavLink[];
  config: AppConfig;
}

export const Header: React.FC<HeaderProps> = ({ navLinks, config }) => {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 bg-white/95 backdrop-blur border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-3 px-3 md:px-6">
        <Link 
          to="/" 
          className="font-bold text-lg md:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          {config.app.name}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-6 items-center">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="text-gray-600 hover:text-blue-600 transition font-medium"
            >
              {link.label}
            </a>
          ))}
          <Link to="/bookings">
            <Button variant="outline" size="sm">🎧 Book Session</Button>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                📊 Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  title="Admin Panel"
                >
                  ⚙️ Admin
                </Link>
              )}
              <span className="text-sm text-gray-600">👤 {user.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="sr-only">Open menu</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-lg block py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setNavOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                  {user ? (
                    <div>
                      <a
                        href="/dashboard"
                        className="block text-lg py-2 text-gray-700 hover:text-blue-600 font-medium mb-2"
                        onClick={() => setNavOpen(false)}
                      >
                        📊 Dashboard
                      </a>
                      {user.role === 'admin' && (
                        <a
                          href="/admin"
                          className="block text-lg py-2 text-gray-700 hover:text-blue-600 font-medium mb-2"
                          onClick={() => setNavOpen(false)}
                        >
                          ⚙️ Admin Panel
                        </a>
                      )}
                      <p className="text-sm text-gray-600 mb-2">👤 {user.username}</p>
                      <button 
                        onClick={() => {
                          logout();
                          setNavOpen(false);
                        }} 
                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/login" onClick={() => setNavOpen(false)}>
                        <button 
                          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Login
                        </button>
                      </Link>
                      <Link to="/signup" onClick={() => setNavOpen(false)}>
                        <button 
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors"
                        >
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  )}
                  <Link to="/bookings" onClick={() => setNavOpen(false)}>
                    <button 
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      🎧 Book Session
                    </button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
