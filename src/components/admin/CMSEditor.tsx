import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { CMSContent, CMSSection, CMSEditorProps } from '@/types/cms.types';
import { CMS_SECTIONS } from '@/types/cms.types';

export const CMSEditor: React.FC<CMSEditorProps> = ({ content, onUpdate, loading = false }) => {
  const [editingField, setEditingField] = useState<{ section: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (section: string, field: string, currentValue: string) => {
    setEditingField({ section, field });
    setEditValue(currentValue || '');
  };

  const handleSave = async () => {
    if (!editingField) return;
    
    setSaving(true);
    try {
      await onUpdate(editingField.section, editingField.field, editValue);
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update content:', error);
      alert('Failed to update content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderField = (section: string, field: string, currentValue: string, fieldConfig: any) => {
    const isEditing = editingField?.section === section && editingField?.field === field;
    const value = currentValue || '';

    if (isEditing) {
      return (
        <div className="space-y-2">
          {fieldConfig.type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={fieldConfig.placeholder}
            />
          ) : (
            <input
              type={fieldConfig.type === 'url' ? 'url' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={fieldConfig.placeholder}
            />
          )}
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1 text-sm bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{value || 'No content set'}</p>
        </div>
        <Button
          onClick={() => handleEdit(section, field, value)}
          className="px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700"
        >
          Edit
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading CMS content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Management System</h2>
        <p className="text-gray-600 mb-6">
          Manage all the content on your homepage. Click "Edit" on any field to update the content.
        </p>
      </div>

      {CMS_SECTIONS.map((sectionConfig) => {
        const sectionContent = content[sectionConfig.section] || {};
        
        return (
          <div key={sectionConfig.section} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {sectionConfig.section} Section
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {sectionConfig.fields.map((fieldConfig) => (
                <div key={fieldConfig.name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {fieldConfig.label}
                  </label>
                  {renderField(
                    sectionConfig.section,
                    fieldConfig.name,
                    sectionContent[fieldConfig.name] || '',
                    fieldConfig
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
