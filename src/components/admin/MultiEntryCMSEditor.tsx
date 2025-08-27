import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface MultiEntryItem {
  id?: string;
  [key: string]: any;
}

interface MultiEntryCMSEditorProps {
  title: string;
  items: MultiEntryItem[];
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'array';
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }>;
  onAdd: (item: MultiEntryItem) => Promise<void>;
  onUpdate: (id: string, item: MultiEntryItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const MultiEntryCMSEditor: React.FC<MultiEntryCMSEditorProps> = ({
  title,
  items,
  fields,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
  error = null
}) => {
  const [editingItem, setEditingItem] = useState<MultiEntryItem | null>(null);
  const [newItem, setNewItem] = useState<MultiEntryItem>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAdd = async () => {
    // Validate required fields
    const errors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && (!newItem[field.name] || (typeof newItem[field.name] === 'string' && newItem[field.name].trim() === ''))) {
        errors[field.name] = `${field.label} is required`;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Check if we have at least some data to add
    const hasData = fields.some(field => newItem[field.name] && newItem[field.name].toString().trim() !== '');
    
    if (!hasData) {
      setValidationErrors({ general: 'Please fill in at least one field' });
      return;
    }
    
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      await onAdd(newItem);
      setNewItem({});
      setIsAdding(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem?.id) return;
    
    setIsEditing(true);
    try {
      await onUpdate(editingItem.id, editingItem);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setIsDeleting(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const renderField = (field: any, value: any, onChange: (value: any) => void) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case 'array':
        return (
          <textarea
            value={Array.isArray(value) ? value.join('\n') : ''}
            onChange={(e) => onChange(e.target.value.split('\n').filter(item => item.trim()))}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  // Show loading spinner only for initial data fetch
  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button
          onClick={() => setIsAdding(true)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Add New'}
        </Button>
      </div>

      {/* Add New Item Form */}
      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Add New {title.slice(0, -1)}</h4>
          {validationErrors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{validationErrors.general}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field, newItem[field.name], (value) => 
                  setNewItem(prev => ({ ...prev, [field.name]: value }))
                )}
                {validationErrors[field.name] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleAdd}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewItem({});
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {editingItem?.id === item.id ? (
              // Edit Mode
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Edit {title.slice(0, -1)}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderField(field, editingItem![field.name], (value) => 
                        setEditingItem(prev => prev ? { ...prev, [field.name]: value } : null)
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={isEditing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isEditing ? <LoadingSpinner size="sm" /> : 'Update'}
                  </Button>
                  <Button
                    onClick={() => setEditingItem(null)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {fields.map((field) => (
                      <div key={field.name}>
                        <span className="text-sm font-medium text-gray-500">{field.label}:</span>
                        <div className="text-sm text-gray-900">
                          {field.type === 'checkbox' ? (
                            item[field.name] ? 'Yes' : 'No'
                          ) : field.type === 'array' ? (
                            Array.isArray(item[field.name]) ? item[field.name].join(', ') : item[field.name]
                          ) : (
                            item[field.name] || '-'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => setEditingItem(item)}
                    size="sm"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id!)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={isDeleting === item.id}
                  >
                    {isDeleting === item.id ? <LoadingSpinner size="sm" /> : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {title.toLowerCase()} found. Add your first one above.
        </div>
      )}
    </div>
  );
};
