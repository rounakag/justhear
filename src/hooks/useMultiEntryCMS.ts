import { useState, useEffect, useCallback } from 'react';

interface MultiEntryItem {
  id?: string;
  [key: string]: any;
}

interface UseMultiEntryCMSReturn {
  items: MultiEntryItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: MultiEntryItem) => Promise<void>;
  updateItem: (id: string, item: MultiEntryItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

export function useMultiEntryCMS(endpoint: string): UseMultiEntryCMSReturn {
  const [items, setItems] = useState<MultiEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}`;
      console.log(`🔍 DEBUG - Fetching ${endpoint} from:`, url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`🔍 DEBUG - ${endpoint} response:`, data);
      
      const items = data[endpoint] || data.items || [];
      console.log(`🔍 DEBUG - ${endpoint} items:`, items);
      
      setItems(items);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const addItem = useCallback(async (item: MultiEntryItem) => {
    try {
      setError(null);
      
      const url = `${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}`;
      console.log(`🔍 DEBUG - Adding ${endpoint} item:`, item);
      console.log(`🔍 DEBUG - POST URL:`, url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      console.log(`🔍 DEBUG - Response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔍 DEBUG - Response error:`, errorText);
        throw new Error(`Failed to add ${endpoint.slice(0, -1)}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`🔍 DEBUG - Response data:`, data);
      
      const newItem = data[endpoint.slice(0, -1)] || data.item || data.testimonial || data.feature || data.faq || data.pricingPlan;
      console.log(`🔍 DEBUG - New item to add:`, newItem);
      
      setItems(prev => {
        const updated = [...prev, newItem];
        console.log(`🔍 DEBUG - Updated items:`, updated);
        return updated;
      });
    } catch (err) {
      console.error(`Error adding ${endpoint.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  }, [endpoint]);

  const updateItem = useCallback(async (id: string, item: MultiEntryItem) => {
    try {
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update ${endpoint.slice(0, -1)}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setItems(prev => prev.map(item => 
        item.id === id ? (data[endpoint.slice(0, -1)] || data.item) : item
      ));
    } catch (err) {
      console.error(`Error updating ${endpoint.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, [endpoint]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${endpoint.slice(0, -1)}: ${response.statusText}`);
      }
      
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(`Error deleting ${endpoint.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, [endpoint]);

  const refreshItems = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  };
}
