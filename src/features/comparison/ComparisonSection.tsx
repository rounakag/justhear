import React from 'react';
import { Card } from '@/design-system/components';
import { cn } from '@/lib/utils';
import type { ComparisonItem, AppConfig } from '@/types';

interface ComparisonSectionProps {
  title: string;
  subtitle: string;
  items: ComparisonItem[];
  config: AppConfig;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({
  title,
  subtitle,
  items,
  config,
}) => {
  return (
    <section id="different" className="py-10 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
          {title}
        </h2>
        <p className="text-center text-gray-600 mb-12 text-base md:text-lg max-w-3xl mx-auto">
          {subtitle}
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {items.map((item, index) => (
            <ComparisonCard key={item.id || index} item={item} index={index} />
          ))}
        </div>
        
        <AnalogySection config={config} />
      </div>
    </section>
  );
};

interface ComparisonCardProps {
  item: ComparisonItem;
  index: number;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ item, index }) => {
  return (
    <Card
      className={cn(
        "p-8",
        index === 0 ? "border-l-4 border-red-500" : "border-l-4 border-blue-500 transform md:-translate-y-4"
      )}
    >
      <h3 className={cn("font-bold mb-4 text-xl", item.color)}>
        {item.icon} {item.title}
      </h3>
      <ul className="text-gray-600 space-y-2">
        {item.items.map((listItem, idx) => (
          <li key={idx} className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            {listItem}
          </li>
        ))}
      </ul>
    </Card>
  );
};

interface AnalogySectionProps {
  config: AppConfig;
}

const AnalogySection: React.FC<AnalogySectionProps> = ({ config }) => {
  return (
    <div className="text-center bg-blue-50 rounded-2xl border border-blue-200 p-8">
      <h3 className="font-bold text-blue-600 mb-6 text-xl">💡 Think of it this way...</h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🔧</span>
          <div>
            <strong className="text-gray-800">Therapy:</strong><br />
            <span className="text-gray-600">A mechanic who fixes your car's engine</span>
          </div>
        </div>
        <div className="text-center">
          <span className="text-4xl mb-4 block">🤗</span>
          <div>
            <strong className="text-gray-800">{config.app.name}:</strong><br />
            <span className="text-gray-600">
              A friend who says "Your car breaking down sucks, and you're handling it amazingly"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
