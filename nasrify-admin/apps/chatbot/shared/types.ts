export interface ChatbotSettings {
  id?: string;
  enabled: boolean;
  preferredModel: string;
  fallbackModels: string[];
  systemPrompt?: string;
  maxTokens: number;
  temperature: number;
  welcomeMessage: string;
  placeholderText: string;
  position: 'bottom-right' | 'bottom-left';
  accentColor: string;
  requireLogin?: boolean;
  rateLimitPerHour?: number;
  updatedAt?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
  tokensUsed?: number;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  reply: string;
  model_used?: string;
  error?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  reply?: string;
  model_used?: string;
  error?: string;
  latencyMs?: number;
}

export const DEFAULT_FREE_MODELS = [
  'deepseek/deepseek-v4.1-flash:free',
  'minimax/minimax-m3:free',
  'mistralai/mistral-medium-3.5:free',
  'qwen/qwen3.6-plus:free',
  'qwen/qwen3.5-397b-a17b:free',
];

export const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  enabled: true,
  preferredModel: 'deepseek/deepseek-v4.1-flash:free',
  fallbackModels: [
    'mistralai/mistral-medium-3.5:free',
    'minimax/minimax-m3:free',
    'qwen/qwen3.6-plus:free',
    'qwen/qwen3.5-397b-a17b:free',
  ],
  systemPrompt: '',
  maxTokens: 300,
  temperature: 0.7,
  welcomeMessage: 'Hi! How can I help you today?',
  placeholderText: 'Ask about products, orders, shipping...',
  position: 'bottom-right',
  accentColor: '#25D366',
  requireLogin: false,
  rateLimitPerHour: 30,
};
