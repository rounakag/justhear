import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system/components';
import { BubbleBackground } from '@/components/BubbleBackground';
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

  // Use CMS content with fallback to props
  const heroTitle1 = getContent('hero', 'title1', title || 'Feeling upset?');
  const heroTitle2 = getContent('hero', 'title2', subtitle || 'We\'re here to listen.');
  const heroSubtitle1 = getContent('hero', 'subtitle1', description || 'Talk anonymously with trained listeners who understand.');
  const heroSubtitle2 = getContent('hero', 'subtitle2', 'Not therapy — just you, truly heard.');
  const heroCtaText = getContent('hero', 'ctaText', ctaText || 'Book Session');
  const heroSecondaryCtaText = getContent('hero', 'secondaryCtaText', secondaryCtaText || 'See How It Works');
  const heroSecondaryCtaHref = getContent('hero', 'secondaryCtaHref', secondaryCtaHref || '#how');
  return (
    <section
      id="top"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-indigo-50 to-violet-100 text-slate-800 relative overflow-hidden animate-breathing"
    >
      <BubbleBackground />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center pt-20 pb-8 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {heroTitle1}{" "}
          <span className="bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
            {heroTitle2}
          </span>
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
            {heroSubtitle1}
          </span>
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {heroSubtitle2}
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/bookings">
            <Button size="lg" className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-white shadow-lg">
              🎧 {heroCtaText}
            </Button>
          </Link>
          <a 
            href={heroSecondaryCtaHref}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full text-blue-600 bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          >
            {heroSecondaryCtaText}
          </a>
        </div>
      </div>
    </section>
  );
};
