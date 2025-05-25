import { Chatbot, ChatbotCategory } from '@/types';

// Mock categories with colors (lowercase keys)
export const CATEGORIES: Record<ChatbotCategory, { color: string, description: string }> = {
  "mathematics": {
    color: "chatbot-blue",
    description: "Math problems and equations"
  },
  "law": {
    color: "chatbot-red",
    description: "Legal advice and information"
  },
  "medical": {
    color: "chatbot-green",
    description: "Health and medical information"
  },
  "programming": {
    color: "chatbot-purple",
    description: "Coding help and debugging"
  },
  "business": {
    color: "chatbot-yellow",
    description: "Business strategies and analytics"
  },
  "science": {
    color: "chatbot-teal",
    description: "Scientific knowledge and research"
  }
};

// Mock chatbots with lowercase categories
export const mockChatbots: Chatbot[] = [
  {
    id: "chatbot-1",
    name: "MathGenius",
    description: "Solve complex math problems with step-by-step explanations",
    category: "mathematics",
    avatar: "https://cdn-icons-png.flaticon.com/512/4807/4807695.png",
    color: "bg-chatbot-blue",
    usageCount: 1352
  },
  {
    id: "chatbot-2",
    name: "LegalEagle",
    description: "Get legal advice and explanations of complex laws",
    category: "law",
    avatar: "https://cdn-icons-png.flaticon.com/512/2942/2942511.png",
    color: "bg-chatbot-red",
    usageCount: 872
  },
  {
    id: "chatbot-3",
    name: "MedConsult",
    description: "Medical information and health advice (not a replacement for doctors)",
    category: "medical",
    avatar: "https://cdn-icons-png.flaticon.com/512/5979/5979127.png",
    color: "bg-chatbot-green",
    usageCount: 2140
  },
  {
    id: "chatbot-4",
    name: "CodeWizard",
    description: "Programming help, debugging, and code explanations",
    category: "programming",
    avatar: "https://cdn-icons-png.flaticon.com/512/6062/6062646.png",
    color: "bg-chatbot-purple",
    usageCount: 3218
  },
  {
    id: "chatbot-5",
    name: "BusinessPro",
    description: "Business strategies, analytics, and market insights",
    category: "business",
    avatar: "https://cdn-icons-png.flaticon.com/512/1256/1256650.png",
    color: "bg-chatbot-yellow",
    usageCount: 943
  },
  {
    id: "chatbot-6",
    name: "ScienceGuru",
    description: "Scientific knowledge across physics, chemistry, biology, and more",
    category: "science",
    avatar: "https://cdn-icons-png.flaticon.com/512/1055/1055113.png",
    color: "bg-chatbot-teal",
    usageCount: 1734
  },
  {
    id: "chatbot-7",
    name: "AlgebraHelper",
    description: "Algebra equations and explanations made simple",
    category: "mathematics",
    avatar: "https://cdn-icons-png.flaticon.com/512/3406/3406898.png",
    color: "bg-chatbot-blue",
    usageCount: 876
  },
  {
    id: "chatbot-8",
    name: "PatentBot",
    description: "Patent law and intellectual property assistance",
    category: "law",
    avatar: "https://cdn-icons-png.flaticon.com/512/2398/2398756.png",
    color: "bg-chatbot-red",
    usageCount: 512
  },
  {
    id: "chatbot-9",
    name: "NutriExpert",
    description: "Nutrition advice and dietary information",
    category: "medical",
    avatar: "https://cdn-icons-png.flaticon.com/512/706/706164.png",
    color: "bg-chatbot-green",
    usageCount: 1321
  },
  {
    id: "chatbot-10",
    name: "FullStackHelper",
    description: "Full-stack development guidance and tips",
    category: "programming",
    avatar: "https://cdn-icons-png.flaticon.com/512/1688/1688451.png",
    color: "bg-chatbot-purple",
    usageCount: 2105
  },
  {
    id: "chatbot-11",
    name: "StartupAdvisor",
    description: "Advice for startups and entrepreneurship",
    category: "business",
    avatar: "https://cdn-icons-png.flaticon.com/512/3208/3208615.png",
    color: "bg-chatbot-yellow",
    usageCount: 687
  },
  {
    id: "chatbot-12",
    name: "PhysicsHelper",
    description: "Physics concepts explained with examples",
    category: "science",
    avatar: "https://cdn-icons-png.flaticon.com/512/2784/2784403.png",
    color: "bg-chatbot-teal",
    usageCount: 943
  }
];