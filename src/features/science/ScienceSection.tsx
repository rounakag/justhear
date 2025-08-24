import React from 'react';
import { Card } from '@/design-system/components';
import type { ScienceItem } from '@/types';

interface ScienceSectionProps {
  title: string;
  items: ScienceItem[];
}

export const ScienceSection: React.FC<ScienceSectionProps> = ({
  title,
  items,
}) => {
  return (
    <section id="science" className="py-10 md:py-20 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          {title}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <ScienceCard key={item.id || index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ScienceCardProps {
  item: ScienceItem;
}

const ScienceCard: React.FC<ScienceCardProps> = ({ item }) => {
  return (
    <Card className="bg-gray-50 p-8 text-center hover:shadow-lg transition">
      <div className="text-4xl mb-6">{item.icon}</div>
      <h3 className="font-bold mb-4 text-xl text-gray-800">{item.title}</h3>
      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
    </Card>
  );
};
