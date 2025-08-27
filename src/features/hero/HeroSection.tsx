import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system/components';
import { useDynamicContent } from '@/hooks/useDynamicContent';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  ctaText,
  secondaryCtaText,
  secondaryCtaHref,
}) => {
  const { getContent } = useDynamicContent();

  // Use CMS content with fallback to new emotional copy
  const heroTitle = getContent('hero', 'title', title || 'Let it out. Feel lighter.');
  const heroSubtitle = getContent('hero', 'subtitle', subtitle || 'An anonymous space to share your feelings. No judgment. Just someone who listens.');
  const heroCtaText = getContent('hero', 'ctaText', ctaText || 'Start Talking');
  const heroSecondaryCtaText = getContent('hero', 'secondaryCtaText', secondaryCtaText || 'Learn How It Works');
  const heroSecondaryCtaHref = getContent('hero', 'secondaryCtaHref', secondaryCtaHref || '#how');

  return (
    <section
      id="top"
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100 text-slate-800 relative overflow-hidden"
    >
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                {heroTitle}
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-gray-700">
              {heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/bookings">
                <Button 
                  size="lg" 
                  className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-10 py-4 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg font-semibold"
                >
                  💬 {heroCtaText}
                </Button>
              </Link>
              
              <a 
                href={heroSecondaryCtaHref}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-gray-700 bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 backdrop-blur-sm"
              >
                {heroSecondaryCtaText}
              </a>
            </div>
          </div>

          {/* Right Side - Chat Bubble Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              
              {/* Main Chat Bubble */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500">
                
                {/* Soundwave Pattern */}
                <div className="absolute top-8 left-8 right-8 flex items-end justify-center space-x-1">
                  {[2, 4, 6, 8, 6, 4, 2, 3, 5, 7, 5, 3].map((height, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-teal-400 to-cyan-400 rounded-full animate-pulse"
                      style={{ 
                        width: '3px', 
                        height: `${height * 4}px`,
                        animationDelay: `${i * 100}ms`
                      }}
                    ></div>
                  ))}
                </div>

                {/* Two People Silhouettes */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
                  
                  {/* Person 1 (Speaker) */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-2 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    <div className="w-8 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  </div>

                  {/* Person 2 (Listener) */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mb-2 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    <div className="w-8 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                  </div>
                </div>

                {/* Floating Hearts */}
                <div className="absolute top-4 right-4 text-pink-400 text-xl animate-bounce">💜</div>
                <div className="absolute bottom-4 left-4 text-blue-400 text-xl animate-bounce delay-500">💙</div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full animate-ping delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
