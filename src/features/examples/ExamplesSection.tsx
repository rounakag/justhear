import React from 'react';
import { ReachOut } from '@/components/sections/ReachOut';
import type { Example } from '@/types';

interface ExamplesSectionProps {
  title: string;
  examples: Example[];
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({
  title,
  examples,
}) => {
  return (
    <section id="examples" className="py-10 md:py-20 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          {title}
        </h2>
        
        {/* Mobile: Horizontal scroll */}
        <div className="sm:hidden flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2">
          {examples.map((example, index) => (
            <ExampleCard key={example.id || index} example={example} />
          ))}
        </div>
        
        {/* Desktop: Geometric layout */}
        <div className="hidden sm:flex justify-center">
          <ReachOut />
        </div>
      </div>
    </section>
  );
};

interface ExampleCardProps {
  example: Example;
}

const ExampleCard: React.FC<ExampleCardProps> = ({ example }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 min-w-[160px] max-w-[200px] text-center hover:shadow-lg transition border border-blue-100 snap-center">
      <div className="text-3xl mb-2">{example.emoji}</div>
      <div className="text-gray-700 text-sm italic">"{example.text}"</div>
    </div>
  );
};
