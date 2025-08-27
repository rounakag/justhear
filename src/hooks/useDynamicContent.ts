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
      console.log('🔍 DEBUG - Fetching CMS content from:', `${apiUrl}/api/cms/content`);
      
      const response = await fetch(`${apiUrl}/api/cms/content`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('🔍 DEBUG - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 DEBUG - Response error:', errorText);
        throw new Error(`Failed to fetch dynamic content: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔍 DEBUG - CMS content received:', data);
      setContent(data.content || {});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dynamic content';
      setError(errorMessage);
      console.error('Error fetching dynamic content:', err);
      
      // Set empty content on error to prevent crashes
      setContent({});
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
