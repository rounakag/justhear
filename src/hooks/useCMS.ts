import { useState, useEffect, useCallback } from 'react';
import type { CMSContent } from '@/types/cms.types';

interface UseCMSReturn {
  content: CMSContent;
  loading: boolean;
  error: string | null;
  updateContent: (section: string, field: string, value: string) => Promise<void>;
  refreshContent: () => Promise<void>;
}

export function useCMS(): UseCMSReturn {
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
        throw new Error('Failed to fetch CMS content');
      }
      
      const data = await response.json();
      setContent(data.content || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CMS content');
      console.error('Error fetching CMS content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContent = useCallback(async (section: string, field: string, value: string) => {
    try {
      const apiUrl = process.env.VITE_API_BASE_URL || 'https://justhear-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/cms/content/${section}/${field}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update CMS content');
      }
      
      // Update local state
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update CMS content');
    }
  }, []);

  const refreshContent = useCallback(async () => {
    await fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    updateContent,
    refreshContent,
  };
}
