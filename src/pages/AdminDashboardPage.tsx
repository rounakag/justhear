import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlotManager } from '@/components/admin/SlotManager';
import { CMSEditor } from '@/components/admin/CMSEditor';
import { MultiEntryCMSEditor } from '@/components/admin/MultiEntryCMSEditor';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCMS } from '@/hooks/useCMS';
import { useMultiEntryCMS } from '@/hooks/useMultiEntryCMS';


export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, adminUser, logoutAdmin, loading } = useAdminAuth();
  const { content, loading: cmsLoading, updateContent } = useCMS();
  const [activeTab, setActiveTab] = useState<'slots' | 'cms' | 'testimonials' | 'features' | 'faq' | 'pricing' | 'reachout'>('slots');

  // Multi-entry CMS hooks
  const testimonials = useMultiEntryCMS('testimonials');
  const features = useMultiEntryCMS('features');
  const faqs = useMultiEntryCMS('faq');
  const pricingPlans = useMultiEntryCMS('pricing');
  const reachOut = useMultiEntryCMS('reachout');

  // Redirect to admin login if not authenticated (but only after loading is complete)
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated (this should only happen briefly)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              {adminUser && (
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-600">
                    Logged in as: <span className="font-medium">{adminUser.email}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Role: {adminUser.role} • Permissions: {adminUser.permissions.join(', ')}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">

              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Main Site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('slots')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'slots'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Slot Management
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'cms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content Management
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'testimonials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Testimonials
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pricing Plans
          </button>
          <button
            onClick={() => setActiveTab('reachout')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'reachout'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reach Out
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'slots' && <SlotManager />}
        {activeTab === 'cms' && (
          <CMSEditor
            content={content}
            onUpdate={updateContent}
            loading={cmsLoading}
          />
        )}
        {activeTab === 'testimonials' && (
          <MultiEntryCMSEditor
            title="Testimonials"
            items={testimonials.items}
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'text', label: 'Testimonial Text', type: 'textarea', required: true },
              { name: 'rating', label: 'Rating', type: 'number', required: true },
              { name: 'emoji', label: 'Emoji', type: 'text', required: true, placeholder: '😊' },
              { name: 'sort_order', label: 'Sort Order', type: 'number' }
            ]}
            onAdd={testimonials.addItem}
            onUpdate={testimonials.updateItem}
            onDelete={testimonials.deleteItem}
            loading={testimonials.loading}
            error={testimonials.error}
          />
        )}
        {activeTab === 'features' && (
          <MultiEntryCMSEditor
            title="Features"
            items={features.items}
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'description', label: 'Description', type: 'textarea', required: true },
              { name: 'icon', label: 'Icon', type: 'text' },
              { name: 'sort_order', label: 'Sort Order', type: 'number' }
            ]}
            onAdd={features.addItem}
            onUpdate={features.updateItem}
            onDelete={features.deleteItem}
            loading={features.loading}
            error={features.error}
          />
        )}
        {activeTab === 'faq' && (
          <MultiEntryCMSEditor
            title="FAQ"
            items={faqs.items}
            fields={[
              { name: 'question', label: 'Question', type: 'text', required: true },
              { name: 'answer', label: 'Answer', type: 'textarea', required: true },
              { name: 'category', label: 'Category', type: 'text' },
              { name: 'sort_order', label: 'Sort Order', type: 'number' }
            ]}
            onAdd={faqs.addItem}
            onUpdate={faqs.updateItem}
            onDelete={faqs.deleteItem}
            loading={faqs.loading}
            error={faqs.error}
          />
        )}
        {activeTab === 'pricing' && (
          <MultiEntryCMSEditor
            title="Pricing Plans"
            items={pricingPlans.items}
            fields={[
              { name: 'name', label: 'Plan Name', type: 'text', required: true },
              { name: 'price', label: 'Price', type: 'number', required: true },
              { name: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP'], required: true },
              { name: 'billing_period', label: 'Billing Period', type: 'select', options: ['month', 'year'], required: true },
              { name: 'description', label: 'Description', type: 'textarea' },
              { name: 'features', label: 'Features (one per line)', type: 'array' },
              { name: 'is_popular', label: 'Popular Plan', type: 'checkbox' },
              { name: 'sort_order', label: 'Sort Order', type: 'number' }
            ]}
            onAdd={pricingPlans.addItem}
            onUpdate={pricingPlans.updateItem}
            onDelete={pricingPlans.deleteItem}
            loading={pricingPlans.loading}
            error={pricingPlans.error}
          />
        )}
        {activeTab === 'reachout' && (
          <MultiEntryCMSEditor
            title="Reach Out Section"
            items={reachOut.items}
            fields={[
              { name: 'emoji', label: 'Emoji', type: 'text', required: true },
              { name: 'title', label: 'Title', type: 'text', required: true },
              { name: 'sort_order', label: 'Sort Order', type: 'number' }
            ]}
            onAdd={reachOut.addItem}
            onUpdate={reachOut.updateItem}
            onDelete={reachOut.deleteItem}
            loading={reachOut.loading}
            error={reachOut.error}
          />
        )}
      </div>
    </div>
  );
};
