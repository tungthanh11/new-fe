
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type ChatbotCategory = 
  | "mathematics" 
  | "law" 
  | "medical" 
  | "programming" 
  | "business" 
  | "science";

export interface Chatbot {
  id: string;
  name: string;
  description: string;
  category: ChatbotCategory;
  avatar: string;
  color: string;
  usageCount: number;
}

export type MessageType = "text" | "code" | "image" | "markdown";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'code' | 'markdown';
  isLoading?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  createdAt: Date;
  chatbotId: string;
  chatId: string | null; // Real chat ID from server, null for new chats
}

// API Response types
export interface CreateChatResponse {
  message: string;
  chatId: string;
}

export interface GetChatResponse {
  message: string;
  chat: {
    chatId: string;
    user_id: string;
    type: string;
    title: string;
    created_at: string;
    messages: Array<{
      sender: 'user' | 'bot';
      message: string;
      created_at: string;
    }>;
  };
}

export interface SendMessageResponse {
  response: string;
}

export interface ChatHistoryResponse {
  chats: Chat[];
}

export type UserPreferences = {
  userId: string;
  theme: "light" | "dark";
  recentChatbots: string[];
  favoriteCategories: ChatbotCategory[];
};
