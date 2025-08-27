import { useState, useEffect } from 'react';

interface ReachOutItem {
  id: string;
  emoji: string;
  title: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useReachOut() {
  const [items, setItems] = useState<ReachOutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReachOut = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = `${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/reachout`;
        console.log('🔍 DEBUG - Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('🔍 DEBUG - Response status:', response.status);
        console.log('🔍 DEBUG - Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Backend fetch error: ${response.status} - ${errorText}`);
          throw new Error(`Failed to fetch reachout: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('🔍 DEBUG - Raw API response:', data);
        
        // Try different possible response formats
        let reachoutItems = [];
        if (data.reachout) {
          reachoutItems = data.reachout;
        } else if (data.items) {
          reachoutItems = data.items;
        } else if (Array.isArray(data)) {
          reachoutItems = data;
        } else {
          console.error('🔍 DEBUG - Unexpected API response format:', data);
          reachoutItems = [];
        }
        
        console.log('🔍 DEBUG - Extracted items:', reachoutItems);
        
        // Sort by sort_order
        const sortedItems = reachoutItems.sort((a: ReachOutItem, b: ReachOutItem) => 
          (a.sort_order || 0) - (b.sort_order || 0)
        );
        
        console.log('🔍 DEBUG - Sorted items:', sortedItems);
        setItems(sortedItems);
      } catch (err) {
        console.error('Error fetching reachout:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reachout items');
        // Return empty array on error to prevent component crash
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReachOut();
  }, []);

  return { items, loading, error };
}
