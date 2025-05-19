
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Chat, Message, Chatbot } from '../types';
import { createMockChat, mockChatbots, generateChatbotResponse } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ChatContextType {
  currentChatbot: Chatbot | null;
  currentChat: Chat | null;
  chatHistory: { [chatbotId: string]: Chat[] };
  isTyping: boolean;
  selectChatbot: (chatbotId: string, chatId?: string) => void;
  createNewChat: (chatbotId: string) => void;
  sendMessage: (content: string) => void;
  clearChat: () => void;
  selectChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentChatbot, setCurrentChatbot] = useState<Chatbot | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<{ [chatbotId: string]: Chat[] }>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load chat history from localStorage
  useEffect(() => {
    if (currentUser) {
      const storedChatHistory = localStorage.getItem(`chatHistory_${currentUser.id}`);
      if (storedChatHistory) {
        try {
          const parsedChatHistory = JSON.parse(storedChatHistory);
          
          // Convert string timestamps back to Date objects
          Object.keys(parsedChatHistory).forEach((chatbotId) => {
            parsedChatHistory[chatbotId].forEach((chat: any) => {
              chat.createdAt = new Date(chat.createdAt);
              chat.updatedAt = new Date(chat.updatedAt);
              chat.messages.forEach((msg: any) => {
                msg.timestamp = new Date(msg.timestamp);
              });
            });
          });
          
          setChatHistory(parsedChatHistory);
        } catch (e) {
          console.error('Failed to parse stored chat history', e);
        }
      }
    }
  }, [currentUser]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (currentUser && Object.keys(chatHistory).length > 0) {
      localStorage.setItem(`chatHistory_${currentUser.id}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, currentUser]);

  // Generate title based on first few messages
  const generateChatTitle = (messages: Message[]): string => {
    if (messages.length === 0) return "New Chat";
    
    // Find first user message
    const userMessage = messages.find(msg => msg.sender === 'user');
    if (userMessage) {
      // Truncate to first ~25 characters or first line
      const title = userMessage.content.split('\n')[0].substring(0, 25);
      return title.length < userMessage.content.length ? `${title}...` : title;
    }
    
    return "New Chat";
  };

  const selectChatbot = (chatbotId: string, chatId?: string) => {
    const chatbot = mockChatbots.find(bot => bot.id === chatbotId);
    
    if (!chatbot) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Chatbot not found",
      });
      return;
    }
    
    setCurrentChatbot(chatbot);
    
    // Check if we have chats for this chatbot
    const botChats = chatHistory[chatbotId] || [];
    
    if (botChats.length > 0) {
      if (chatId) {
        // Find specific chat if chatId is provided
        const selectedChat = botChats.find(chat => chat.id === chatId);
        if (selectedChat) {
          setCurrentChat(selectedChat);
        } else {
          // If chatId not found, use the most recent chat
          setCurrentChat(botChats[botChats.length - 1]);
        }
      } else {
        // If no chatId is provided, use the most recent chat
        setCurrentChat(botChats[botChats.length - 1]);
      }
    } else {
      // Create a new chat if none exists
      createNewChat(chatbotId);
    }
  };

  const createNewChat = (chatbotId: string) => {
    const chatbot = mockChatbots.find(bot => bot.id === chatbotId);
    
    if (!chatbot) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Chatbot not found",
      });
      return;
    }
    
    const newChat = createMockChat(chatbotId);
    
    // Add new chat to history
    setChatHistory(prev => {
      const botChats = prev[chatbotId] || [];
      return {
        ...prev,
        [chatbotId]: [...botChats, newChat]
      };
    });
    
    // Set as current chat
    setCurrentChat(newChat);
    setCurrentChatbot(chatbot);
    
    toast({
      title: "New chat created",
      description: `Started a new conversation with ${chatbot.name}`,
    });
  };

  const selectChat = (chatId: string) => {
    if (!currentChatbot) return;
    
    const botChats = chatHistory[currentChatbot.id] || [];
    const selectedChat = botChats.find(chat => chat.id === chatId);
    
    if (selectedChat) {
      setCurrentChat(selectedChat);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentChatbot || !currentChat) {
      return;
    }
    
    // Create user message
    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      content,
      type: "text",
      sender: "user",
      timestamp: new Date(),
      chatbotId: currentChatbot.id,
    };
    
    // Create temporary bot message for typing indicator
    const tempBotMessage: Message = {
      id: `msg-bot-temp-${Date.now()}`,
      content: "",
      type: "text",
      sender: "bot",
      timestamp: new Date(),
      chatbotId: currentChatbot.id,
      isLoading: true,
    };
    
    // Update chat with user message and temp bot message
    const updatedChat: Chat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage, tempBotMessage],
      updatedAt: new Date()
    };
    
    // Update current chat
    setCurrentChat(updatedChat);
    
    // Update chat in history
    setChatHistory(prev => {
      const botChats = [...(prev[currentChatbot.id] || [])];
      const chatIndex = botChats.findIndex(chat => chat.id === currentChat.id);
      
      if (chatIndex !== -1) {
        botChats[chatIndex] = updatedChat;
      }
      
      return {
        ...prev,
        [currentChatbot.id]: botChats
      };
    });
    
    setIsTyping(true);
    
    try {
      // Generate chatbot response
      const botResponse = await generateChatbotResponse(currentChatbot.id, content);
      
      // Remove temp message and add the real response
      const finalMessages = updatedChat.messages
        .filter(msg => msg.id !== tempBotMessage.id)
        .concat(botResponse);
      
      // Update title if this is first user message
      let chatTitle = updatedChat.title;
      if (!chatTitle && userMessage === updatedChat.messages[1]) {
        chatTitle = generateChatTitle([userMessage]);
      }
      
      const finalChat: Chat = {
        ...updatedChat,
        messages: finalMessages,
        updatedAt: new Date(),
        title: chatTitle
      };
      
      // Update current chat
      setCurrentChat(finalChat);
      
      // Update chat in history
      setChatHistory(prev => {
        const botChats = [...(prev[currentChatbot.id] || [])];
        const chatIndex = botChats.findIndex(chat => chat.id === currentChat.id);
        
        if (chatIndex !== -1) {
          botChats[chatIndex] = finalChat;
        }
        
        return {
          ...prev,
          [currentChatbot.id]: botChats
        };
      });
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate a response. Please try again.",
      });
      
      // Remove the temporary message if there's an error
      const errorMessages = updatedChat.messages.filter(msg => msg.id !== tempBotMessage.id);
      const errorChat: Chat = {
        ...updatedChat,
        messages: errorMessages,
        updatedAt: new Date()
      };
      
      setCurrentChat(errorChat);
      
      // Update chat in history
      setChatHistory(prev => {
        const botChats = [...(prev[currentChatbot.id] || [])];
        const chatIndex = botChats.findIndex(chat => chat.id === currentChat.id);
        
        if (chatIndex !== -1) {
          botChats[chatIndex] = errorChat;
        }
        
        return {
          ...prev,
          [currentChatbot.id]: botChats
        };
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (!currentChatbot || !currentChat) return;
    
    // Create new empty chat
    const newChat = createMockChat(currentChatbot.id);
    
    // Update current chat
    setCurrentChat(newChat);
    
    // Update chat in history
    setChatHistory(prev => {
      const botChats = [...(prev[currentChatbot.id] || [])];
      const chatIndex = botChats.findIndex(chat => chat.id === currentChat.id);
      
      if (chatIndex !== -1) {
        botChats[chatIndex] = newChat;
      }
      
      return {
        ...prev,
        [currentChatbot.id]: botChats
      };
    });
    
    toast({
      title: "Chat cleared",
      description: "Your chat history has been cleared",
    });
  };

  const value = {
    currentChatbot,
    currentChat,
    chatHistory,
    isTyping,
    selectChatbot,
    createNewChat,
    sendMessage,
    clearChat,
    selectChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
