/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Chat, Message, Chatbot } from '../types';
import { api } from '../contexts/AuthContext';

interface ChatContextType {
  currentChatbot: Chatbot | null;
  currentChat: Chat | null;
  chatHistory: { [chatbotId: string]: Chat[] };
  isTyping: boolean;
  isLoadingChat: boolean; // New loading state for chat loading
  // Updated function signatures
  selectChatbot: (chatbot: Chatbot) => void;
  sendMessage: (message: string) => Promise<void>;
  createNewChat: (chatbotId?: string) => void;
  clearCurrentChat: () => void;
  getChatHistory: (chatbotType: string) => Promise<Chat[]>;
  loadChatById: (chatId: string) => Promise<Chat | null>; // Updated to return Chat
  deleteChatById: (chatId: string) => Promise<boolean>; // New function to delete chat
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
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false); // New loading state

  // Helper function to convert category to lowercase
  const getChatbotType = useCallback((category: string): string => {
    return category.toLowerCase();
  }, []);

  // Helper function to transform API chat data to our Chat type
  const transformApiChatToChat = useCallback((apiChat: any, chatbotId: string): Chat => {
    return {
      id: apiChat.chatId || apiChat.id,
      chatId: apiChat.chatId,
      title: apiChat.title?.trim() || 'New Chat', // Added trim() to remove \n
      messages: (apiChat.messages || []).map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        content: msg.message || msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at || msg.timestamp || Date.now()),
        type: msg.type || 'text'
      })),
      // Use created_at from API as both createdAt and updatedAt
      createdAt: new Date(apiChat.created_at || Date.now()),
      updatedAt: new Date(apiChat.created_at || Date.now()), // Set updatedAt same as createdAt
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

  // Updated loadChatById function that returns the loaded chat
  const loadChatById = useCallback(async (chatId: string): Promise<Chat | null> => {
    if (!currentChatbot) {
      console.error('No chatbot selected');
      return null;
    }

    try {
      setIsLoadingChat(true);
      console.log('Loading chat by ID:', chatId);
      
      const response = await api.get(`/api/chat/${chatId}`);
      const { chat } = response.data;
      
      if (chat) {
        const transformedChat = transformApiChatToChat(chat, currentChatbot.id);
        console.log('Chat loaded successfully:', transformedChat);
        
        setCurrentChat(transformedChat);
        return transformedChat;
      } else {
        console.log('No chat data found');
        return null;
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      // If chat doesn't exist, create new one
      createNewChat(currentChatbot.id);
      return null;
    } finally {
      setIsLoadingChat(false);
    }
  }, [currentChatbot, transformApiChatToChat]);

  // New function to delete chat by ID
  const deleteChatById = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      console.log('Deleting chat by ID:', chatId);
      
      // Call DELETE API
      await api.delete(`/api/chat/${chatId}`);
      
      // Remove chat from local state if it exists in chatHistory
      if (currentChatbot) {
        setChatHistory(prev => {
          const updatedHistory = { ...prev };
          if (updatedHistory[currentChatbot.id]) {
            updatedHistory[currentChatbot.id] = updatedHistory[currentChatbot.id].filter(
              chat => chat.chatId !== chatId && chat.id !== chatId
            );
          }
          return updatedHistory;
        });
      }
      
      // If the deleted chat is currently selected, create a new chat
      if (currentChat && (currentChat.chatId === chatId || currentChat.id === chatId)) {
        console.log('Deleted chat was currently selected, creating new chat');
        createNewChat(currentChatbot?.id);
      }
      
      console.log('Chat deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }, [currentChatbot, currentChat]);

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
            title: chat.title?.trim() || 'New Chat',
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
      
      // Transform API response to Chat format and sort by created_at descending
      const transformedChats = chats.map((apiChat: any) => transformApiChatToChat(apiChat, currentChatbot?.id || ''));
      
      // Sort by created_at in descending order (most recent first)
      return transformedChats.sort((a: Chat, b: Chat) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
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
    isLoadingChat, // Add new loading state
    selectChatbot,
    sendMessage,
    createNewChat,
    clearCurrentChat,
    getChatHistory,
    loadChatById,
    deleteChatById // Add new delete function
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};