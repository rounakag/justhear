import React from 'react';
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
    emoji: string;
    sort_order: number;
  };
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[280px] max-w-[320px] shrink-0 snap-center hover:-translate-y-2 p-6 border border-gray-100 relative overflow-hidden group">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full translate-y-8 -translate-x-8 opacity-20"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Rating stars with enhanced styling */}
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400 text-lg">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>
                ⭐
              </span>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500 font-medium">
            {testimonial.rating}/5
          </span>
        </div>
        
        {/* Quote with enhanced typography */}
        <blockquote className="italic mb-6 text-gray-700 leading-relaxed text-base relative">
          <span className="absolute -top-2 -left-2 text-4xl text-blue-200 opacity-60">"</span>
          {testimonial.text}
          <span className="absolute -bottom-2 -right-2 text-4xl text-blue-200 opacity-60">"</span>
        </blockquote>
        
        {/* User info with emoji avatar */}
        <div className="flex gap-4 items-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl shadow-md border-2 border-white">
              {testimonial.emoji}
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 blur-sm"></div>
          </div>
          <div className="flex-1">
            <strong className="block text-gray-800 font-semibold text-sm">
              {testimonial.name}
            </strong>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <small className="text-gray-500 text-xs font-medium">Verified User</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
