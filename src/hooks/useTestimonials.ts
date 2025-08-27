import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  emoji: string;
  sort_order: number;
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/testimonials`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        
        const data = await response.json();
        const items = data.testimonials || [];
        
        // Sort by sort_order
        const sortedItems = items.sort((a: Testimonial, b: Testimonial) => a.sort_order - b.sort_order);
        
        setTestimonials(sortedItems);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return { testimonials, loading, error };
}
