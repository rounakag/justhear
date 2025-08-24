import React from 'react';
import { Card } from '@/design-system/components';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

interface TestimonialsSectionProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title,
  subtitle,
  testimonials,
}) => {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-800">
          {title}
        </h2>
        <p className="text-center text-gray-600 mb-8 text-base sm:text-lg">
          {subtitle}
        </p>
        <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x md:snap-none pb-4 md:pb-0 scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id || index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Card
      variant={testimonial.featured ? 'elevated' : 'default'}
      className={cn(
        "min-w-[280px] max-w-[320px] shrink-0 snap-center transition-transform hover:-translate-y-1 p-6",
        testimonial.featured && "border-2 border-blue-500 shadow-lg"
      )}
    >
      <div className="text-yellow-400 mb-3 text-lg">
        {'⭐'.repeat(testimonial.rating)}
      </div>
      <blockquote className="italic mb-4 text-gray-700 leading-relaxed">
        "{testimonial.quote}"
      </blockquote>
      <div className="flex gap-3 items-center">
        <span className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 text-xl">
          {testimonial.emoji}
        </span>
        <div>
          <strong className="block text-gray-800">Anonymous user</strong>
          <small className="text-gray-500">{testimonial.meta}</small>
        </div>
      </div>
    </Card>
  );
};
