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
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Backend fetch error: ${response.status} - ${errorText}`);
          throw new Error(`Failed to fetch reachout: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        const reachoutItems = data.reachout || data.items || [];
        
        // Sort by sort_order
        const sortedItems = reachoutItems.sort((a: ReachOutItem, b: ReachOutItem) => 
          (a.sort_order || 0) - (b.sort_order || 0)
        );
        
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
