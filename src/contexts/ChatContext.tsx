
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Chat, Message, Chatbot } from '../types';
import { createMockChat, mockChatbots, generateChatbotResponse } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ChatContextType {
  currentChatbot: Chatbot | null;
  currentChat: Chat | null;
  chats: { [chatbotId: string]: Chat };
  isTyping: boolean;
  selectChatbot: (chatbotId: string) => void;
  sendMessage: (content: string) => void;
  clearChat: () => void;
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
  const [chats, setChats] = useState<{ [chatbotId: string]: Chat }>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load chat history from localStorage
  useEffect(() => {
    if (currentUser) {
      const storedChats = localStorage.getItem(`chats_${currentUser.id}`);
      if (storedChats) {
        try {
          const parsedChats = JSON.parse(storedChats);
          // Convert string timestamps back to Date objects
          Object.values(parsedChats).forEach((chat: any) => {
            chat.createdAt = new Date(chat.createdAt);
            chat.updatedAt = new Date(chat.updatedAt);
            chat.messages.forEach((msg: any) => {
              msg.timestamp = new Date(msg.timestamp);
            });
          });
          setChats(parsedChats);
        } catch (e) {
          console.error('Failed to parse stored chats', e);
        }
      }
    }
  }, [currentUser]);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (currentUser && Object.keys(chats).length > 0) {
      localStorage.setItem(`chats_${currentUser.id}`, JSON.stringify(chats));
    }
  }, [chats, currentUser]);

  const selectChatbot = (chatbotId: string) => {
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
    
    // Find existing chat or create a new one
    if (chats[chatbotId]) {
      setCurrentChat(chats[chatbotId]);
    } else {
      const newChat = createMockChat(chatbotId);
      setChats(prevChats => ({
        ...prevChats,
        [chatbotId]: newChat
      }));
      setCurrentChat(newChat);
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
    
    // Update state
    setCurrentChat(updatedChat);
    setChats(prevChats => ({
      ...prevChats,
      [currentChatbot.id]: updatedChat
    }));
    setIsTyping(true);
    
    try {
      // Generate chatbot response
      const botResponse = await generateChatbotResponse(currentChatbot.id, content);
      
      // Remove temp message and add the real response
      const finalMessages = updatedChat.messages
        .filter(msg => msg.id !== tempBotMessage.id)
        .concat(botResponse);
      
      const finalChat: Chat = {
        ...updatedChat,
        messages: finalMessages,
        updatedAt: new Date()
      };
      
      // Update state with final response
      setCurrentChat(finalChat);
      setChats(prevChats => ({
        ...prevChats,
        [currentChatbot.id]: finalChat
      }));
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
      setChats(prevChats => ({
        ...prevChats,
        [currentChatbot.id]: errorChat
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (!currentChatbot) return;
    
    const newChat = createMockChat(currentChatbot.id);
    
    setCurrentChat(newChat);
    setChats(prevChats => ({
      ...prevChats,
      [currentChatbot.id]: newChat
    }));
    
    toast({
      title: "Chat cleared",
      description: "Your chat history has been cleared",
    });
  };

  const value = {
    currentChatbot,
    currentChat,
    chats,
    isTyping,
    selectChatbot,
    sendMessage,
    clearChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
