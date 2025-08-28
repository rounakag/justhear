import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system/components';
import { useDynamicContent } from '@/hooks/useDynamicContent';

interface HeroSectionProps {
  /* No props needed - uses CMS data only */
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const { getContent, loading, error } = useDynamicContent();

  // Use CMS content with fallbacks for demo/production
  const heroTitle = getContent('hero', 'title', 'JustHear - A Safe Space to Be Heard');
  const heroSubtitle = getContent('hero', 'subtitle', 'Connect with compassionate listeners who provide a judgment-free space for you to share your thoughts, feelings, and experiences.');
  const heroCtaText = getContent('hero', 'ctaText', 'Book Your Session');
  const heroSecondaryCtaText = getContent('hero', 'secondaryCtaText', 'Learn More');
  const heroSecondaryCtaHref = getContent('hero', 'secondaryCtaHref', '#features');

  // Show loading state to prevent empty container flash
  if (loading) {
    return (
      <section
        id="top"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white relative overflow-hidden"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </section>
    );
  }

  // Show error state with fallback content
  if (error) {
    console.warn('CMS loading error, using fallback content:', error);
  }

  return (
    <section
      id="top"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white relative overflow-hidden"
    >
      {/* Floating shapes for ambiance */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-15 w-15 h-15 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-10 h-10 bg-white/10 rounded-full animate-bounce delay-2000"></div>
      </div>

      <div className="mx-auto px-5 lg:px-8 max-w-7xl relative z-10 pt-24">
        <div className="grid lg:grid-cols-2 gap-15 items-center">
          
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white tracking-tight">
              {heroTitle}
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-white/90 font-normal">
              {heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/bookings">
                <Button 
                  size="lg" 
                  className="rounded-full bg-white text-[#5b47db] hover:bg-gray-50 px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg font-semibold min-w-[180px]"
                >
                  {heroCtaText}
                </Button>
              </Link>
              
              <a 
                href={heroSecondaryCtaHref}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white bg-transparent border-2 border-white/70 hover:bg-white/10 hover:border-white hover:-translate-y-1 transition-all duration-300 min-w-[180px]"
              >
                {heroSecondaryCtaText}
              </a>
            </div>
          </div>

          {/* Right Side - SVG Illustration */}
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <svg className="w-full max-w-[400px] h-auto filter drop-shadow-2xl" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background circle */}
              <circle cx="200" cy="160" r="140" fill="rgba(255, 255, 255, 0.1)" opacity="0.6"/>
              
              {/* Person 1 (Sharing) */}
              <g transform="translate(120, 80)">
                {/* Head */}
                <circle cx="30" cy="30" r="25" fill="#FFD93D"/>
                {/* Hair */}
                <path d="M10 25 C15 15, 45 15, 50 25 C50 20, 45 10, 35 10 C25 5, 15 5, 5 10 C-5 15, 0 25, 10 25" fill="#8B4513"/>
                {/* Body */}
                <ellipse cx="30" cy="80" rx="20" ry="30" fill="#87CEEB"/>
                {/* Arms */}
                <ellipse cx="10" cy="65" rx="8" ry="20" fill="#FFD93D" transform="rotate(-20 10 65)"/>
                <ellipse cx="50" cy="65" rx="8" ry="20" fill="#FFD93D" transform="rotate(30 50 65)"/>
                {/* Speech bubble */}
                <ellipse cx="70" cy="40" rx="25" ry="18" fill="rgba(255, 255, 255, 0.9)"/>
                <path d="M50 45 L45 55 L55 50 Z" fill="rgba(255, 255, 255, 0.9)"/>
                {/* Dots in speech bubble */}
                <circle cx="63" cy="35" r="2" fill="#667eea"/>
                <circle cx="70" cy="35" r="2" fill="#667eea"/>
                <circle cx="77" cy="35" r="2" fill="#667eea"/>
                <circle cx="65" cy="45" r="1.5" fill="#667eea"/>
                <circle cx="75" cy="45" r="1.5" fill="#667eea"/>
              </g>

              {/* Person 2 (Listening) */}
              <g transform="translate(220, 90)">
                {/* Head */}
                <circle cx="30" cy="30" r="25" fill="#FFB6C1"/>
                {/* Hair */}
                <path d="M8 22 C12 12, 48 12, 52 22 C52 18, 47 8, 37 8 C27 3, 23 3, 13 8 C3 13, 8 22, 8 22" fill="#4B0082"/>
                {/* Body */}
                <ellipse cx="30" cy="80" rx="18" ry="28" fill="#98FB98"/>
                {/* Arms (relaxed, listening position) */}
                <ellipse cx="15" cy="70" rx="7" ry="18" fill="#FFB6C1" transform="rotate(-10 15 70)"/>
                <ellipse cx="45" cy="70" rx="7" ry="18" fill="#FFB6C1" transform="rotate(10 45 70)"/>
                {/* Heart (showing empathy) */}
                <path d="M70 35 C70 30, 75 25, 80 30 C85 25, 90 30, 90 35 C90 45, 80 55, 80 55 C80 55, 70 45, 70 35 Z" fill="#FF69B4" opacity="0.7"/>
                {/* Small hearts floating */}
                <circle cx="85" cy="20" r="3" fill="#FF69B4" opacity="0.5"/>
                <circle cx="95" cy="30" r="2" fill="#FF69B4" opacity="0.4"/>
              </g>

              {/* Connecting line (empathy) */}
              <path d="M170 140 Q200 120 220 140" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="3" fill="none" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
              </path>

              {/* Ground */}
              <ellipse cx="200" cy="280" rx="160" ry="15" fill="rgba(255, 255, 255, 0.1)"/>
            </svg>
          </div>
        </div>
      </div>


    </section>
  );
};
