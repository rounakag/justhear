import React from 'react';
import { Button } from '@/design-system/components';
import { BubbleBackground } from '@/components/BubbleBackground';
import { SchedulerModal } from '@/components/SchedulerModal';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  ctaText,
  secondaryCtaText,
  secondaryCtaHref,
}) => {
  return (
    <section
      id="top"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-indigo-50 to-violet-100 text-slate-800 relative overflow-hidden animate-breathing"
    >
      <BubbleBackground />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center pt-20 pb-8 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {title}{" "}
          <span className="bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
            {subtitle}
          </span>
          <br />
          {description}
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
            Talk anonymously with trained listeners who understand.
          </span>
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            <strong>Not therapy</strong> — just you, truly <em>heard</em>.
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SchedulerModal>
            <Button size="lg" className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-white shadow-lg">
              🎧 {ctaText}
            </Button>
          </SchedulerModal>
          <Button 
            variant="secondary" 
            size="lg"
            className="rounded-full text-blue-600 bg-white hover:bg-gray-50 text-base py-3 px-6" 
            asChild
          >
            <a href={secondaryCtaHref}>{secondaryCtaText}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};
