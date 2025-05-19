
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type ChatbotCategory = 
  | "Mathematics" 
  | "Law" 
  | "Medical" 
  | "Programming" 
  | "Business" 
  | "Science";

export type Chatbot = {
  id: string;
  name: string;
  description: string;
  category: ChatbotCategory;
  avatar: string;
  color: string;
  usageCount?: number;
};

export type MessageType = "text" | "code" | "image" | "markdown";

export type Message = {
  id: string;
  content: string;
  type: MessageType;
  sender: "user" | "bot";
  timestamp: Date;
  chatbotId: string;
  isLoading?: boolean;
};

export type Chat = {
  id: string;
  chatbotId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

export type UserPreferences = {
  userId: string;
  theme: "light" | "dark";
  recentChatbots: string[];
  favoriteCategories: ChatbotCategory[];
};
