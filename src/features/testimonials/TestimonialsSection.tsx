import React from 'react';
import { Card } from '@/design-system/components';
import { cn } from '@/lib/utils';
import { useDynamicContent } from '@/hooks/useDynamicContent';
import { useTestimonials } from '@/hooks/useTestimonials';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title,
  subtitle,
}) => {
  const { getContent } = useDynamicContent();
  const { testimonials, loading, error } = useTestimonials();

  // Use CMS content with fallback to props
  const testimonialsTitle = getContent('testimonials', 'title', title || 'Real stories, real validation');
  const testimonialsSubtitle = getContent('testimonials', 'subtitle', subtitle || 'See how a simple conversation changed everything');
  if (loading) {
    return (
      <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <p className="text-red-600">Failed to load testimonials</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-800">
          {testimonialsTitle}
        </h2>
        <p className="text-center text-gray-600 mb-8 text-base sm:text-lg">
          {testimonialsSubtitle}
        </p>
        {testimonials.length > 0 ? (
          <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x md:snap-none pb-4 md:pb-0 scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id || index} testimonial={testimonial} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No testimonials available</p>
          </div>
        )}
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: {
    id: string;
    name: string;
    text: string;
    rating: number;
    avatar_url?: string;
    sort_order: number;
  };
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Card
      variant="default"
      className="min-w-[280px] max-w-[320px] shrink-0 snap-center transition-transform hover:-translate-y-1 p-6"
    >
      <div className="text-yellow-400 mb-3 text-lg">
        {'⭐'.repeat(testimonial.rating)}
      </div>
      <blockquote className="italic mb-4 text-gray-700 leading-relaxed">
        "{testimonial.text}"
      </blockquote>
      <div className="flex gap-3 items-center">
        {testimonial.avatar_url ? (
          <img 
            src={testimonial.avatar_url} 
            alt={testimonial.name}
            className="rounded-full w-12 h-12 object-cover"
          />
        ) : (
          <span className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 text-xl">
            {testimonial.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <strong className="block text-gray-800">{testimonial.name}</strong>
          <small className="text-gray-500">Verified User</small>
        </div>
      </div>
    </Card>
  );
};
