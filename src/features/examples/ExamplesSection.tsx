import React from 'react';
import { ReachOut } from '@/components/sections/ReachOut';
import { useDynamicContent } from '@/hooks/useDynamicContent';

interface ExamplesSectionProps {
  title: string;
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({
  title,
}) => {
  const { getContent } = useDynamicContent();
  const cmsTitle = getContent('examples', 'title', title);
  
  return (
    <section id="examples" className="py-10 md:py-20 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          {cmsTitle}
        </h2>
        
        {/* Mobile: Horizontal scroll */}
        <div className="sm:hidden flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2">
          <ReachOut />
        </div>
        
        {/* Desktop: Geometric layout */}
        <div className="hidden sm:flex justify-center">
          <ReachOut />
        </div>
      </div>
    </section>
  );
};


