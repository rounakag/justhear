// Core application types
export interface AppConfig {
  app: {
    name: string;
    description: string;
    version: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    auth: boolean;
    booking: boolean;
    testimonials: boolean;
  };
  pricing: {
    perSessionPrice: number;
    originalPrice: number;
    sessionDuration: number;
  };
  contact: {
    email: string;
    phone: string;
  };
}

// Navigation types
export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

// User and authentication types
export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Content types
export interface Testimonial {
  id: string;
  quote: string;
  emoji: string;
  meta: string;
  featured: boolean;
  rating: number;
}

export interface Example {
  id: string;
  emoji: string;
  text: string;
  category: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
}

export interface ComparisonItem {
  id: string;
  icon: string;
  title: string;
  color: string;
  items: string[];
}

export interface ScienceItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
  category: string;
}

// Booking types
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  bookedBy?: string;
}

export interface BookingSession {
  id: string;
  userId: string;
  date: string;
  timeSlot: TimeSlot;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  price: number;
}

// UI Component types
export interface ButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface SignUpFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Theme and styling types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Hook types
export interface UseLocalStorageOptions<T> {
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

// Error types
export interface AppError {
  id: string;
  message: string;
  code?: string;
  timestamp: Date;
  stack?: string;
  userInfo?: {
    userId?: string;
    userAgent?: string;
    url?: string;
  };
}

// Event types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: Date;
}
