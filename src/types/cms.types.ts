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

export interface CMSEditorProps {
  content: CMSContent;
  onUpdate: (section: string, field: string, value: string) => Promise<void>;
  loading?: boolean;
}

export const CMS_SECTIONS: CMSSection[] = [
  {
    section: 'hero',
    fields: [
      { name: 'title1', label: 'Title 1', type: 'text', placeholder: 'e.g., Feeling upset?' },
      { name: 'title2', label: 'Title 2', type: 'text', placeholder: 'e.g., We\'re here to listen.' },
      { name: 'subtitle1', label: 'Subtitle 1', type: 'textarea', placeholder: 'e.g., Talk anonymously with trained listeners who understand.' },
      { name: 'subtitle2', label: 'Subtitle 2', type: 'textarea', placeholder: 'e.g., Not therapy — just you, truly heard.' },
      { name: 'ctaText', label: 'CTA Button Text', type: 'text', placeholder: 'e.g., Book Session' },
      { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text', placeholder: 'e.g., See How It Works' },
      { name: 'secondaryCtaHref', label: 'Secondary CTA Link', type: 'url', placeholder: 'e.g., #how' }
    ]
  },
  {
    section: 'testimonials',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g., Real stories, real validation' },
      { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', placeholder: 'e.g., See how a simple conversation changed everything' }
    ]
  },
  {
    section: 'examples',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g., Reach out to us, when u feel' }
    ]
  },
  {
    section: 'features',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g., How it works' }
    ]
  },
  {
    section: 'comparison',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g., We\'re not therapy — we\'re something different' },
      { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', placeholder: 'e.g., Sometimes you don\'t need to be fixed or analyzed...' }
    ]
  },
  {
    section: 'science',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g., Why validation works' }
    ]
  },
  {
    section: 'pricing',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g., Choose your plan' }
    ]
  },
  {
    section: 'faq',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g., Frequently Asked Questions' }
    ]
  }
];
