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

// Helper function to extract item from response based on endpoint
function extractItemFromResponse(data: any, endpoint: string): any {
  const responseMap: Record<string, string> = {
    testimonials: 'testimonial',
    features: 'feature',
    faq: 'faq',
    pricing: 'pricingPlan',
    reachout: 'reachout'
  };
  
  const key = responseMap[endpoint] || endpoint.slice(0, -1);
  return data[key] || data.item || data;
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
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend fetch error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      const items = data[endpoint] || data.items || [];
      
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
      
      // Optimistic update - add item immediately with temporary ID
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...item, id: tempId };
      setItems(prev => [...prev, optimisticItem]);
      
      const url = `${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend error: ${response.status} - ${errorText}`);
        // Rollback optimistic update on error
        setItems(prev => prev.filter(item => item.id !== tempId));
        throw new Error(`Failed to add ${endpoint.slice(0, -1)}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      const newItem = extractItemFromResponse(data, endpoint);
      
      if (newItem) {
        // Replace optimistic item with real item
        setItems(prev => prev.map(item => item.id === tempId ? newItem : item));
      } else {
        // Rollback optimistic update on error
        setItems(prev => prev.filter(item => item.id !== tempId));
        throw new Error('Failed to get new item from response');
      }
    } catch (err) {
      console.error(`Error adding ${endpoint.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  }, [endpoint]);

  const updateItem = useCallback(async (id: string, item: MultiEntryItem) => {
    try {
      setError(null);
      console.log(`🔍 DEBUG - Updating ${endpoint} item:`, { id, item });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      console.log(`🔍 DEBUG - Update response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to update ${endpoint.slice(0, -1)}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`🔍 DEBUG - Update response data:`, data);
      
      const updatedItem = extractItemFromResponse(data, endpoint);
      console.log(`🔍 DEBUG - Extracted updated item:`, updatedItem);
      
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
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
      
      // Optimistic update - remove item immediately
      const itemToDelete = items.find(item => item.id === id);
      setItems(prev => prev.filter(item => item.id !== id));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Rollback optimistic update on error
        if (itemToDelete) {
          setItems(prev => [...prev, itemToDelete]);
        }
        throw new Error(`Failed to delete ${endpoint.slice(0, -1)}: ${response.statusText}`);
      }
    } catch (err) {
      console.error(`Error deleting ${endpoint.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, [endpoint, items]);

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
