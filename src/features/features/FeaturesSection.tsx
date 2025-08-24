import React from 'react';
import { Card } from '@/design-system/components';
import type { Feature } from '@/types';

interface FeaturesSectionProps {
  title: string;
  features: Feature[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  title,
  features,
}) => {
  return (
    <section id="how" className="py-12 md:py-20 bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 md:mb-10 text-gray-800">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id || index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  return (
    <Card className="text-center hover:shadow-lg transition">
      <div className="text-4xl mb-4 md:mb-6">{feature.icon}</div>
      <h3 className="font-bold mb-3 md:mb-4 text-lg md:text-xl text-gray-800">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
        {feature.desc}
      </p>
    </Card>
  );
};
