export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateField(
  value: any, 
  fieldName: string, 
  rules: ValidationRule
): string | null {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${fieldName} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `${fieldName} must be at least ${rules.min}`;
    }
    
    if (rules.max !== undefined && value > rules.max) {
      return `${fieldName} must be no more than ${rules.max}`;
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must have at least ${rules.minLength} items`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must have no more than ${rules.maxLength} items`;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm(
  data: Record<string, any>, 
  fieldRules: Record<string, ValidationRule>
): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(fieldRules)) {
    const error = validateField(data[fieldName], fieldName, rules);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

// Predefined validation rules for common CMS fields
export const CMS_VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/
  },
  text: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  rating: {
    required: true,
    min: 1,
    max: 5
  },
  price: {
    required: true,
    min: 0,
    max: 10000
  },
  question: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  answer: {
    required: true,
    minLength: 20,
    maxLength: 2000
  },
  title: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  sort_order: {
    min: 0,
    max: 1000
  }
};
