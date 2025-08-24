export const config = {
  // App configuration
  app: {
    name: 'justhear.me',
    version: '1.0.0',
    description: 'Your on-demand safe space to be heard and validated.',
  },
  
  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  
  // Feature flags
  features: {
    auth: true,
    booking: true,
    testimonials: true,
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugMode: import.meta.env.DEV,
  },
  
  // Pricing configuration
  pricing: {
    perSessionPrice: 49,
    originalPrice: 150,
    sessionDuration: 30, // minutes
  },
  
  // Contact information
  contact: {
    phone: '+1 (999) 999-9999',
    email: 'hello@justhear.me',
  },
} as const;

export type Config = typeof config;
