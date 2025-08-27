export interface CMSContent { 
  [section: string]: { 
    [field: string]: string; 
  }; 
}

export interface CMSSection { 
  section: string; 
  fields: CMSField[]; 
}

export interface CMSField { 
  name: string; 
  label: string; 
  type: 'text' | 'textarea' | 'url' | 'email'; 
  placeholder?: string; 
  description?: string; 
  required?: boolean; 
}

// Multi-entry CMS types
export interface MultiEntryItem {
  id?: string;
  [key: string]: any;
}

export interface TestimonialItem extends MultiEntryItem {
  name: string;
  text: string;
  rating: number;
  avatar_url?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeatureItem extends MultiEntryItem {
  title: string;
  description: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQItem extends MultiEntryItem {
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PricingPlanItem extends MultiEntryItem {
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  description?: string;
  features?: string[];
  is_popular?: boolean;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// CMS Field types
export interface CMSFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'array';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

// CMS Response types
export interface CMSResponse<T> {
  data: T;
  total: number;
  timestamp: string;
}

export interface TestimonialsResponse extends CMSResponse<TestimonialItem[]> {
  testimonials: TestimonialItem[];
}

export interface FeaturesResponse extends CMSResponse<FeatureItem[]> {
  features: FeatureItem[];
}

export interface FAQResponse extends CMSResponse<FAQItem[]> {
  faqs: FAQItem[];
}

export interface PricingResponse extends CMSResponse<PricingPlanItem[]> {
  pricingPlans: PricingPlanItem[];
}

// CMS Editor props
export interface CMSEditorProps { 
  content: CMSContent; 
  onUpdate: (section: string, field: string, value: string) => Promise<void>; 
  loading?: boolean; 
}

export interface MultiEntryCMSEditorProps {
  title: string;
  items: MultiEntryItem[];
  fields: CMSFieldConfig[];
  onAdd: (item: MultiEntryItem) => Promise<void>;
  onUpdate: (id: string, item: MultiEntryItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

// CMS Sections configuration
export const CMS_SECTIONS: CMSSection[] = [
  {
    section: 'hero',
    fields: [
      { name: 'title1', label: 'Title 1', type: 'text', required: true },
      { name: 'title2', label: 'Title 2', type: 'text', required: true },
      { name: 'subtitle1', label: 'Subtitle 1', type: 'textarea', required: true },
      { name: 'subtitle2', label: 'Subtitle 2', type: 'textarea', required: true },
      { name: 'ctaText', label: 'CTA Button Text', type: 'text', required: true },
      { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text' },
      { name: 'secondaryCtaHref', label: 'Secondary CTA Link', type: 'url' }
    ]
  },
  {
    section: 'testimonials',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', required: true }
    ]
  },
          {
          section: 'examples',
          fields: [
            { name: 'title', label: 'Reach Out Section Title', type: 'text', required: true },
            { name: 'central_card_text', label: 'Central Card Text', type: 'text', required: true }
          ]
        },
  {
    section: 'features',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true }
    ]
  },
  {
    section: 'comparison',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', required: true }
    ]
  },
  {
    section: 'science',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true }
    ]
  },
  {
    section: 'pricing',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true }
    ]
  },
  {
    section: 'faq',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true }
    ]
  }
];
