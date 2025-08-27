import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system/components';
import { useDynamicContent } from '@/hooks/useDynamicContent';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  secondaryCtaText,
  secondaryCtaHref,
}) => {
  const { getContent } = useDynamicContent();

  // Use CMS content with fallback to the exact copy from screenshots
  const heroTitle = getContent('hero', 'title', title || 'Sometimes, you just need to be heard.');
  const heroSubtitle = getContent('hero', 'subtitle', subtitle || 'Talk about your feelings—anger, loneliness, or sadness—in a safe, non-judgmental space.');
  const heroCtaText = getContent('hero', 'ctaText', ctaText || 'Book Session');
  const heroSecondaryCtaText = getContent('hero', 'secondaryCtaText', secondaryCtaText || 'See how it works');
  const heroSecondaryCtaHref = getContent('hero', 'secondaryCtaHref', secondaryCtaHref || '#how');

  return (
    <section
      id="top"
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-300 text-white relative overflow-hidden"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-xl"></div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
              {heroTitle}
            </h1>
            
            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-white/90">
              {heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/bookings">
                <Button 
                  size="lg" 
                  className="rounded-full bg-white text-purple-600 hover:bg-gray-50 px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-semibold"
                >
                  {heroCtaText}
                </Button>
              </Link>
              
              <a 
                href={heroSecondaryCtaHref}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                {heroSecondaryCtaText}
              </a>
            </div>
          </div>

          {/* Right Side - Friendly Figures Illustration */}
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              
              {/* Outer glow circles */}
              <div className="absolute inset-0 rounded-full bg-purple-200/20 blur-2xl"></div>
              <div className="absolute inset-4 rounded-full bg-purple-200/30 blur-xl"></div>
              
              {/* Main illustration container */}
              <div className="relative z-10 flex items-center justify-center h-full">
                
                {/* Figure 1 (Left) - Yellow with blue clothes */}
                <div className="relative mr-8">
                  {/* Head */}
                  <div className="w-16 h-16 bg-yellow-400 rounded-full mb-2 relative">
                    {/* Hair */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-amber-700 rounded-full"></div>
                  </div>
                  {/* Body */}
                  <div className="w-12 h-16 bg-blue-300 rounded-full mx-auto"></div>
                  
                  {/* Speech bubble */}
                  <div className="absolute -top-4 -right-16 bg-white rounded-2xl px-3 py-2 shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                    {/* Speech bubble tail */}
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-white border-b-4 border-b-transparent"></div>
                  </div>
                </div>

                {/* Figure 2 (Right) - Pink with green clothes */}
                <div className="relative ml-8">
                  {/* Head */}
                  <div className="w-16 h-16 bg-pink-300 rounded-full mb-2 relative">
                    {/* Hair */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-purple-600 rounded-full"></div>
                  </div>
                  {/* Body */}
                  <div className="w-12 h-16 bg-green-300 rounded-full mx-auto"></div>
                  
                  {/* Hearts */}
                  <div className="absolute -top-2 -right-4">
                    <div className="text-pink-400 text-2xl animate-bounce">💖</div>
                  </div>
                  <div className="absolute top-4 -right-6">
                    <div className="text-pink-300 text-lg animate-bounce delay-500">💕</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
