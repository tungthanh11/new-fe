
import { Chat, Chatbot, ChatbotCategory, Message, User, UserPreferences } from "../types";

// Mock categories with colors
export const CATEGORIES: Record<ChatbotCategory, { color: string, description: string }> = {
  "Mathematics": {
    color: "chatbot-blue",
    description: "Math problems and equations"
  },
  "Law": {
    color: "chatbot-red",
    description: "Legal advice and information"
  },
  "Medical": {
    color: "chatbot-green",
    description: "Health and medical information"
  },
  "Programming": {
    color: "chatbot-purple",
    description: "Coding help and debugging"
  },
  "Business": {
    color: "chatbot-yellow",
    description: "Business strategies and analytics"
  },
  "Science": {
    color: "chatbot-teal",
    description: "Scientific knowledge and research"
  }
};

// Mock users
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Demo User",
    email: "demo@example.com",
    avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
  }
];

// Mock chatbots
export const mockChatbots: Chatbot[] = [
  {
    id: "chatbot-1",
    name: "MathGenius",
    description: "Solve complex math problems with step-by-step explanations",
    category: "Mathematics",
    avatar: "https://cdn-icons-png.flaticon.com/512/4807/4807695.png",
    color: "bg-chatbot-blue",
    usageCount: 1352
  },
  {
    id: "chatbot-2",
    name: "LegalEagle",
    description: "Get legal advice and explanations of complex laws",
    category: "Law",
    avatar: "https://cdn-icons-png.flaticon.com/512/2942/2942511.png",
    color: "bg-chatbot-red",
    usageCount: 872
  },
  {
    id: "chatbot-3",
    name: "MedConsult",
    description: "Medical information and health advice (not a replacement for doctors)",
    category: "Medical",
    avatar: "https://cdn-icons-png.flaticon.com/512/5979/5979127.png",
    color: "bg-chatbot-green",
    usageCount: 2140
  },
  {
    id: "chatbot-4",
    name: "CodeWizard",
    description: "Programming help, debugging, and code explanations",
    category: "Programming",
    avatar: "https://cdn-icons-png.flaticon.com/512/6062/6062646.png",
    color: "bg-chatbot-purple",
    usageCount: 3218
  },
  {
    id: "chatbot-5",
    name: "BusinessPro",
    description: "Business strategies, analytics, and market insights",
    category: "Business",
    avatar: "https://cdn-icons-png.flaticon.com/512/1256/1256650.png",
    color: "bg-chatbot-yellow",
    usageCount: 943
  },
  {
    id: "chatbot-6",
    name: "ScienceGuru",
    description: "Scientific knowledge across physics, chemistry, biology, and more",
    category: "Science",
    avatar: "https://cdn-icons-png.flaticon.com/512/1055/1055113.png",
    color: "bg-chatbot-teal",
    usageCount: 1734
  },
  {
    id: "chatbot-7",
    name: "AlgebraHelper",
    description: "Algebra equations and explanations made simple",
    category: "Mathematics",
    avatar: "https://cdn-icons-png.flaticon.com/512/3406/3406898.png",
    color: "bg-chatbot-blue",
    usageCount: 876
  },
  {
    id: "chatbot-8",
    name: "PatentBot",
    description: "Patent law and intellectual property assistance",
    category: "Law",
    avatar: "https://cdn-icons-png.flaticon.com/512/2398/2398756.png",
    color: "bg-chatbot-red",
    usageCount: 512
  },
  {
    id: "chatbot-9",
    name: "NutriExpert",
    description: "Nutrition advice and dietary information",
    category: "Medical",
    avatar: "https://cdn-icons-png.flaticon.com/512/706/706164.png",
    color: "bg-chatbot-green",
    usageCount: 1321
  },
  {
    id: "chatbot-10",
    name: "FullStackHelper",
    description: "Full-stack development guidance and tips",
    category: "Programming",
    avatar: "https://cdn-icons-png.flaticon.com/512/1688/1688451.png",
    color: "bg-chatbot-purple",
    usageCount: 2105
  },
  {
    id: "chatbot-11",
    name: "StartupAdvisor",
    description: "Advice for startups and entrepreneurship",
    category: "Business",
    avatar: "https://cdn-icons-png.flaticon.com/512/3208/3208615.png",
    color: "bg-chatbot-yellow",
    usageCount: 687
  },
  {
    id: "chatbot-12",
    name: "PhysicsHelper",
    description: "Physics concepts explained with examples",
    category: "Science",
    avatar: "https://cdn-icons-png.flaticon.com/512/2784/2784403.png",
    color: "bg-chatbot-teal",
    usageCount: 943
  }
];

// Mock messages
export const createMockMessages = (chatbotId: string): Message[] => {
  const chatbot = mockChatbots.find(bot => bot.id === chatbotId);
  
  if (!chatbot) {
    return [];
  }

  const messages: Message[] = [];
  
  // Add a welcome message based on the chatbot category
  messages.push({
    id: `msg-welcome-${chatbotId}`,
    content: `Hello! I'm ${chatbot.name}, your assistant for ${chatbot.category}. How can I help you today?`,
    type: "text",
    sender: "bot",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    chatbotId: chatbotId
  });
  
  return messages;
};

// Mock chats
export const createMockChat = (chatbotId: string): Chat => {
  return {
    id: `chat-${chatbotId}`,
    chatbotId: chatbotId,
    messages: createMockMessages(chatbotId),
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date()
  };
};

// Mock user preferences
export const mockUserPreferences: UserPreferences = {
  userId: "user-1",
  theme: "light",
  recentChatbots: ["chatbot-1", "chatbot-4", "chatbot-6"],
  favoriteCategories: ["Programming", "Mathematics", "Science"]
};

// Helper function to simulate chatbot responses
export const generateChatbotResponse = (chatbotId: string, userMessage: string): Promise<Message> => {
  const chatbot = mockChatbots.find(bot => bot.id === chatbotId);
  
  if (!chatbot) {
    return Promise.reject("Chatbot not found");
  }
  
  // Simulate delay for realistic response timing
  return new Promise((resolve) => {
    setTimeout(() => {
      let response: string;
      let type: MessageType = "text";
      
      // Generate different responses based on chatbot category
      switch (chatbot.category) {
        case "Mathematics":
          if (userMessage.toLowerCase().includes("equation") || userMessage.toLowerCase().includes("solve")) {
            response = "To solve this equation, we need to isolate the variable by performing the same operation on both sides...";
          } else {
            response = "I can help with various math problems including algebra, calculus, geometry, and statistics. What specific problem do you want to solve?";
          }
          break;
          
        case "Programming":
          if (userMessage.toLowerCase().includes("code") || userMessage.toLowerCase().includes("error")) {
            response = "```javascript\n// Here's an example solution\nfunction solve(input) {\n  return input.map(x => x * 2).filter(x => x > 10);\n}\n```\nThis code maps over the input array, doubles each value, then filters to keep only values greater than 10.";
            type = "code";
          } else {
            response = "I can help with coding questions, debugging, and explaining programming concepts. What language or framework are you working with?";
          }
          break;
          
        case "Law":
          response = "Please note that I provide general legal information, not legal advice. For your specific situation, you should consult with a qualified attorney.";
          break;
          
        case "Medical":
          response = "While I can provide general health information, please consult with a healthcare professional for medical advice tailored to your specific situation.";
          break;
          
        case "Business":
          response = "Based on market trends, I'd recommend focusing on sustainable growth strategies while maintaining healthy cash flow. Would you like more specific advice for your industry?";
          break;
          
        case "Science":
          response = "That's an interesting scientific question! The current research suggests that...[scientific explanation]. Would you like me to elaborate on any specific aspect?";
          break;
          
        default:
          response = `Thank you for your message. How can I assist you further with ${chatbot.category}?`;
      }
      
      resolve({
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: response,
        type: type,
        sender: "bot",
        timestamp: new Date(),
        chatbotId: chatbotId
      });
    }, 1500); // 1.5 second delay
  });
};
