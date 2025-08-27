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
  console.log(`🔍 DEBUG - extractItemFromResponse: endpoint=${endpoint}, key=${key}, data=`, data);
  
  // Try multiple possible keys
  const result = data[key] || data[endpoint] || data.item || data;
  console.log(`🔍 DEBUG - extractItemFromResponse result:`, result);
  return result;
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
        const errorText = await response.text();
        console.error(`Backend fetch error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`🔍 DEBUG - Raw response data for ${endpoint}:`, data);
      
      // Handle different response formats
      let items = [];
      console.log(`🔍 DEBUG - Checking data[${endpoint}]:`, data[endpoint]);
      console.log(`🔍 DEBUG - Checking data[${endpoint + 's'}]:`, data[endpoint + 's']);
      console.log(`🔍 DEBUG - Checking data.items:`, data.items);
      
      if (data[endpoint]) {
        items = data[endpoint];
        console.log(`🔍 DEBUG - Using data[${endpoint}]`);
      } else if (data[endpoint + 's']) {
        items = data[endpoint + 's']; // Handle plural form (faqs, testimonials, etc.)
        const pluralKey = endpoint + 's';
        console.log(`🔍 DEBUG - Using data[${pluralKey}]`);
        console.log(`🔍 DEBUG - data[${pluralKey}] type:`, typeof data[pluralKey]);
        console.log(`🔍 DEBUG - data[${pluralKey}] length:`, Array.isArray(data[pluralKey]) ? data[pluralKey].length : 'not an array');
        console.log(`🔍 DEBUG - data[${pluralKey}] content:`, data[pluralKey]);
      } else if (data.items) {
        items = data.items;
        console.log(`🔍 DEBUG - Using data.items`);
      } else {
        console.log(`🔍 DEBUG - No matching key found, using empty array`);
      }
      
      console.log(`🔍 DEBUG - Extracted items for ${endpoint}:`, items);
      console.log(`🔍 DEBUG - Final items type:`, typeof items);
      console.log(`🔍 DEBUG - Final items length:`, Array.isArray(items) ? items.length : 'not an array');
      
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
        // Refresh items to ensure consistency
        await fetchItems();
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
      
      const url = `${import.meta.env.VITE_API_URL || 'https://justhear-backend.onrender.com'}/api/cms/${endpoint}/${id}`;
      console.log(`🔍 DEBUG - Update URL:`, url);
      console.log(`🔍 DEBUG - Update payload:`, JSON.stringify(item, null, 2));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      console.log(`🔍 DEBUG - Update response status:`, response.status);
      console.log(`🔍 DEBUG - Update response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to update ${endpoint.slice(0, -1)}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`🔍 DEBUG - Update response data:`, data);
      
      const updatedItem = extractItemFromResponse(data, endpoint);
      console.log(`🔍 DEBUG - Extracted updated item:`, updatedItem);
      
      if (!updatedItem || !updatedItem.id) {
        console.error(`🔍 DEBUG - Invalid updated item:`, updatedItem);
        throw new Error('Invalid response from server - missing item data');
      }
      
      setItems(prev => {
        const newItems = prev.map(item => 
          item.id === id ? updatedItem : item
        );
        console.log(`🔍 DEBUG - Updated items list:`, newItems);
        return newItems;
      });
      
      // Refresh items to ensure consistency
      console.log(`🔍 DEBUG - Refreshing items after update...`);
      await fetchItems();
    } catch (err) {
      console.error(`Error updating ${endpoint.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, [endpoint, fetchItems]);

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
      
      // Refresh items after successful delete
      await fetchItems();
    } catch (err) {
      console.error(`Error deleting ${endpoint.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, [endpoint, items, fetchItems]);

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
