import { useState, useEffect, useCallback } from 'react';
import type { CMSContent } from '@/types/cms.types';

interface UseDynamicContentReturn {
  content: CMSContent;
  loading: boolean;
  error: string | null;
  getContent: (section: string, field: string, fallback?: string) => string;
}

export function useDynamicContent(): UseDynamicContentReturn {
  const [content, setContent] = useState<CMSContent>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.VITE_API_BASE_URL || 'https://justhear-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/cms/content`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dynamic content');
      }
      
      const data = await response.json();
      setContent(data.content || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dynamic content');
      console.error('Error fetching dynamic content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getContent = useCallback((section: string, field: string, fallback: string = '') => {
    return content[section]?.[field] || fallback;
  }, [content]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    getContent,
  };
}
