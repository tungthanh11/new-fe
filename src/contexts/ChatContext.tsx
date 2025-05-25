/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Chat, Message, Chatbot } from '../types';
import { api } from '../contexts/AuthContext';

interface ChatContextType {
  currentChatbot: Chatbot | null;
  currentChat: Chat | null;
  chatHistory: { [chatbotId: string]: Chat[] };
  isTyping: boolean;
  // Updated function signatures
  selectChatbot: (chatbot: Chatbot) => void;
  sendMessage: (message: string) => Promise<void>;
  createNewChat: (chatbotId?: string) => void;
  clearCurrentChat: () => void;
  getChatHistory: (chatbotType: string) => Promise<Chat[]>;
  loadChatById: (chatId: string) => Promise<void>;
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

  // Helper function to convert category to lowercase
  const getChatbotType = useCallback((category: string): string => {
    return category.toLowerCase();
  }, []);

  // Helper function to transform API chat data to our Chat type
  const transformApiChatToChat = useCallback((apiChat: any, chatbotId: string): Chat => {
    return {
      id: apiChat.chatId || apiChat.id,
      chatId: apiChat.chatId,
      title: apiChat.title || 'New Chat',
      messages: (apiChat.messages || []).map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        content: msg.message || msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at || msg.timestamp || Date.now()),
        type: msg.type || 'text'
      })),
      createdAt: new Date(apiChat.created_at || Date.now()),
      updatedAt: new Date(apiChat.updated_at || apiChat.created_at || Date.now()),
      chatbotId: chatbotId
    };
  }, []);

  // Select a chatbot and initialize a new chat
  const selectChatbot = useCallback((chatbot: Chatbot) => {
    setCurrentChatbot(chatbot);
    // Create a new empty chat when selecting a chatbot
    const newChat: Chat = {
      id: `temp-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      chatbotId: chatbot.id,
      chatId: null
    };
    setCurrentChat(newChat);
  }, []);

  // Load existing chat by ID
  const loadChatById = useCallback(async (chatId: string) => {
    try {
      const response = await api.get(`/api/chat/${chatId}`);
      const { chat } = response.data;
      
      if (chat && currentChatbot) {
        const transformedChat = transformApiChatToChat(chat, currentChatbot.id);
        setCurrentChat(transformedChat);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      // If chat doesn't exist, create new one
      if (currentChatbot) {
        createNewChat(currentChatbot.id);
      }
    }
  }, [currentChatbot, transformApiChatToChat]);

  // Send message function
  const sendMessage = useCallback(async (message: string) => {
    if (!currentChatbot || !currentChat || isTyping) return;

    try {
      setIsTyping(true);
      
      // Add user message to chat immediately
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        content: message,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      };

      const updatedMessages = [...currentChat.messages, userMessage];
      setCurrentChat(prev => prev ? { 
        ...prev, 
        messages: updatedMessages,
        updatedAt: new Date()
      } : null);

      // Check if this is the first message (no chatId yet)
      if (!currentChat.chatId) {
        // First message - create new chat
        const chatbotType = getChatbotType(currentChatbot.category);
        const response = await api.post('/api/chat/new', {
          type: chatbotType,
          query: message
        });

        const { chatId } = response.data;
        
        // Update current chat with real chatId
        setCurrentChat(prev => prev ? { ...prev, chatId, id: chatId } : null);

        // Get the initial response from the chat
        const chatResponse = await api.get(`/api/chat/${chatId}`);
        const { chat } = chatResponse.data;

        // Update chat with title and bot response
        const botMessages = chat.messages.filter((msg: any) => msg.sender === 'bot');
        if (botMessages.length > 0) {
          const botMessage: Message = {
            id: `msg-bot-${Date.now()}`,
            content: botMessages[0].message,
            sender: 'bot',
            timestamp: new Date(botMessages[0].created_at),
            type: 'text'
          };

          setCurrentChat(prev => prev ? {
            ...prev,
            title: chat.title.trim(),
            messages: [...updatedMessages, botMessage],
            updatedAt: new Date()
          } : null);
        }
      } else {
        // Subsequent messages - send to existing chat
        const response = await api.post(`/api/chat/${currentChat.chatId}`, {
          query: message
        });

        // Add bot response to chat
        const botMessage: Message = {
          id: `msg-bot-${Date.now()}`,
          content: response.data.response,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        };

        setCurrentChat(prev => prev ? {
          ...prev,
          messages: [...updatedMessages, botMessage],
          updatedAt: new Date()
        } : null);
      }

      // Update chat history in state
      if (currentChatbot && currentChat) {
        setChatHistory(prev => ({
          ...prev,
          [currentChatbot.id]: prev[currentChatbot.id] || []
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error - maybe show error message
    } finally {
      setIsTyping(false);
    }
  }, [currentChatbot, currentChat, isTyping, getChatbotType]);

  // Create new chat for current chatbot or specified chatbot
  const createNewChat = useCallback((chatbotId?: string) => {
    const targetChatbot = chatbotId ? 
      // If chatbotId provided, we might need to find the chatbot (this assumes currentChatbot is already set)
      currentChatbot 
      : currentChatbot;
      
    if (!targetChatbot) return;

    const newChat: Chat = {
      id: `temp-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      chatbotId: targetChatbot.id,
      chatId: null
    };
    setCurrentChat(newChat);
  }, [currentChatbot]);

  // Clear current chat
  const clearCurrentChat = useCallback(() => {
    if (!currentChatbot) return;

    const newChat: Chat = {
      id: `temp-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      chatbotId: currentChatbot.id,
      chatId: null
    };
    setCurrentChat(newChat);
  }, [currentChatbot]);

  // Get chat history for a specific chatbot type
  const getChatHistory = useCallback(async (chatbotType: string): Promise<Chat[]> => {
    try {
      const response = await api.get(`/api/chat/history?chatbot_type=${chatbotType.toLowerCase()}`);
      const chats = response.data.chat_list || [];
      
      // Transform API response to Chat format
      return chats.map((apiChat: any) => transformApiChatToChat(apiChat, currentChatbot?.id || ''));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }, [transformApiChatToChat, currentChatbot]);

  const value = {
    currentChatbot,
    currentChat,
    chatHistory,
    isTyping,
    selectChatbot,
    sendMessage,
    createNewChat,
    clearCurrentChat,
    getChatHistory,
    loadChatById
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};