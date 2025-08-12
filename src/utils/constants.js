// Application constants
export const CONFIG_VERSION = "2.0";

export const CATEGORIES = ['hardware', 'software', 'services'];

export const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const SEVERITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const MODULE_TYPES = {
  SINGLE_SELECT: 'single-select',
  MULTI_SELECT_QUANTITY: 'multi-select-quantity'
};

export const VALIDATION_STATUS = {
  VALID: 'valid',
  INCOMPLETE: 'incomplete',
  ERROR: 'error'
};

export const AI_RESPONSE_DELAY = 1000; // milliseconds

// Currency formatting
export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

// File upload/download settings
export const ACCEPTED_FILE_TYPES = ".json";
export const DEFAULT_FILENAME_PREFIX = "infrastructure-config";

// UI constants
export const CHAT_PANEL_WIDTH = "384px"; // w-96 in Tailwind
export const ANIMATION_DURATION = 300; // milliseconds
