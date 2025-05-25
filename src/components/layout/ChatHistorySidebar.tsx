/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chatbot, Chat } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, MessageSquare, ChevronRight, Trash2 } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { format, isValid, parseISO } from "date-fns";

interface ChatHistorySidebarProps {
  chatbot: Chatbot;
  currentChatId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  chatbot,
  currentChatId,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { createNewChat, getChatHistory, deleteChatById } = useChat();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingChatIds, setDeletingChatIds] = useState<Set<string>>(new Set());

  // Helper function to convert category to lowercase (matching ChatContext)
  const getChatbotType = useCallback((category: string): string => {
    return category.toLowerCase();
  }, []);

  // Enhanced date parsing function
  const parseDate = useCallback((dateValue: any): Date => {
    if (!dateValue) return new Date(0); // Return epoch time for null/undefined
    
    if (dateValue instanceof Date) {
      return isValid(dateValue) ? dateValue : new Date(0);
    }
    
    if (typeof dateValue === 'string') {
      // Try parsing ISO string first
      const isoDate = parseISO(dateValue);
      if (isValid(isoDate)) return isoDate;
      
      // Try parsing as regular date string
      const parsedDate = new Date(dateValue);
      if (isValid(parsedDate)) return parsedDate;
    }
    
    if (typeof dateValue === 'number') {
      const numericDate = new Date(dateValue);
      if (isValid(numericDate)) return numericDate;
    }
    
    return new Date(0); // Return epoch time for invalid dates
  }, []);

  // Enhanced sorting function for chat history
  const sortChatsByDate = useCallback((chats: Chat[]): Chat[] => {
    return [...chats].sort((a, b) => {
      // Priority: updatedAt > createdAt > current time as fallback
      const aUpdated = parseDate(a.updatedAt);
      const aCreated = parseDate(a.createdAt);
      const bUpdated = parseDate(b.updatedAt);
      const bCreated = parseDate(b.createdAt);
      
      // Use the most recent date for each chat
      const aTime = aUpdated > aCreated ? aUpdated : aCreated;
      const bTime = bUpdated > bCreated ? bUpdated : bCreated;
      
      // Sort in descending order (most recent first)
      return bTime.getTime() - aTime.getTime();
    });
  }, [parseDate]);

  // Load chat history when chatbot changes
  const loadChatHistory = useCallback(async () => {
    if (!chatbot) return;

    console.log('Loading chat history for chatbot:', chatbot.name, 'Category:', chatbot.category);
    setIsLoading(true);
    
    try {
      const chatbotType = getChatbotType(chatbot.category);
      console.log('Getting chat history for type:', chatbotType);
      
      const history = await getChatHistory(chatbotType);
      console.log('Chat history received:', history);
      
      if (Array.isArray(history)) {
        // Apply enhanced sorting
        const sortedHistory = sortChatsByDate(history);
        
        console.log('Setting sorted chat history:', sortedHistory);
        setChatHistory(sortedHistory);
      } else {
        console.warn('Chat history is not an array:', history);
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setChatHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [chatbot, getChatHistory, getChatbotType, sortChatsByDate]);

  // Function to handle chat deletion
  const handleDeleteChat = useCallback(async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault(); // Prevent navigation when clicking delete button
    e.stopPropagation();
    
    if (!chatId || deletingChatIds.has(chatId)) return;

    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return;
    }

    console.log('Deleting chat:', chatId);
    
    // Add to deleting set to prevent multiple clicks
    setDeletingChatIds(prev => new Set(prev).add(chatId));
    
    try {
      const success = await deleteChatById(chatId);
      
      if (success) {
        // Remove from local state immediately for better UX
        setChatHistory(prev => prev.filter(chat => 
          chat.chatId !== chatId && chat.id !== chatId
        ));
        
        // If deleted chat was currently selected, navigate to new chat
        if (currentChatId === chatId) {
          navigate(`/chat/${chatbot.id}`);
        }
        
        console.log('Chat deleted successfully');
      } else {
        console.error('Failed to delete chat');
        // Could show a toast notification here
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      // Could show a toast notification here
    } finally {
      // Remove from deleting set
      setDeletingChatIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    }
  }, [deleteChatById, currentChatId, chatbot.id, navigate, deletingChatIds]);

  // Load chat history when chatbot changes
  useEffect(() => {
    console.log('ChatHistorySidebar useEffect triggered, chatbot:', chatbot?.name);
    loadChatHistory();
  }, [loadChatHistory]);

  // Also reload when coming back to the page or when chat context changes
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Delayed reload of chat history');
      loadChatHistory();
    }, 100);

    return () => clearTimeout(timer);
  }, [chatbot?.id, loadChatHistory]);

  // Re-sort chat history when it changes (in case new chats are added)
  useEffect(() => {
    if (chatHistory.length > 0) {
      const sortedHistory = sortChatsByDate(chatHistory);
      // Only update state if the order actually changed
      const hasOrderChanged = chatHistory.some((chat, index) => 
        chat.id !== sortedHistory[index]?.id
      );
      
      if (hasOrderChanged) {
        console.log('Re-sorting chat history due to order change');
        setChatHistory(sortedHistory);
      }
    }
  }, [chatHistory, sortChatsByDate]);

  const handleNewChat = useCallback(() => {
    if (chatbot) {
      createNewChat(chatbot.id);
      // Navigate to the chatbot page without chatId to start a new chat
      navigate(`/chat/${chatbot.id}`);
    }
  }, [createNewChat, chatbot, navigate]);

  const handleBackToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Enhanced date formatting function
  const formatChatDate = useCallback((chat: Chat) => {
    try {
      // Use the most recent date between updatedAt and createdAt
      const updatedDate = parseDate(chat.updatedAt);
      const createdDate = parseDate(chat.createdAt);
      
      const dateToUse = updatedDate > createdDate ? updatedDate : createdDate;
      
      // If date is still epoch time, show "Recently"
      if (dateToUse.getTime() === 0) {
        return "Recently";
      }
      
      return format(dateToUse, "MMM d, h:mm a");
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Recently";
    }
  }, [parseDate]);

  console.log('Rendering ChatHistorySidebar with chatHistory:', chatHistory);

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button and chatbot info */}
      <div className="h-16 flex items-center px-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex-1 flex items-center min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToHome}
              className="mr-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
              <AvatarImage src={chatbot.avatar} />
              <AvatarFallback className={chatbot.color}>
                {chatbot.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-lg truncate">{chatbot.name}</span>
          </div>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToHome}
            className="mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-2">
        <Button
          variant="outline"
          className={cn(
            "w-full gap-2 justify-start bg-white text-black border border-border shadow-none hover:bg-gray-50",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isCollapsed && (
          <div className="px-4 py-2 border-b border-sidebar-border">
            <h3 className="text-xs uppercase text-sidebar-foreground/60 font-semibold tracking-wider">
              Chat History ({chatbot.category}) - {chatHistory.length} chats
            </h3>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className={cn("py-2", isCollapsed ? "px-1" : "px-2")}>
            {isLoading ? (
              !isCollapsed && (
                <div className="px-3 py-2 text-sm text-sidebar-foreground/70">
                  Loading chat history...
                </div>
              )
            ) : chatHistory && chatHistory.length > 0 ? (
              <div className="space-y-1">
                {chatHistory.map((chat) => {
                  const chatId = chat.chatId || chat.id;
                  const isActive = currentChatId === chatId;
                  const isDeleting = deletingChatIds.has(chatId);
                  
                  console.log('Rendering chat:', chatId, 'Active:', isActive, 'Current:', currentChatId);
                  
                  return (
                    <div
                      key={chatId}
                      className={cn(
                        "group relative",
                        isCollapsed ? "px-0" : "px-1"
                      )}
                    >
                      <Link
                        to={`/chat/${chatbot.id}?chatId=${chatId}`}
                        className="block"
                      >
                        <Button
                          variant="ghost"
                          disabled={isDeleting}
                          className={cn(
                            "w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                            isCollapsed && "justify-center px-2",
                            isDeleting && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isCollapsed ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : (
                            <div className="truncate text-left w-full pr-8">
                              <div className="font-medium truncate">
                                {isDeleting ? "Deleting..." : (chat.title || `Chat ${chatId.slice(-4)}`)}
                              </div>
                              <div className="text-xs text-sidebar-foreground/70">
                                {formatChatDate(chat)}
                              </div>
                            </div>
                          )}
                        </Button>
                      </Link>
                      
                      {/* Delete button - only show when not collapsed and on hover */}
                      {!isCollapsed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting}
                          onClick={(e) => handleDeleteChat(e, chatId)}
                          className={cn(
                            "absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                            "hover:bg-red-100 hover:text-red-600 text-sidebar-foreground/50",
                            isActive && "text-sidebar-accent-foreground/50"
                          )}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              !isCollapsed && (
                <div className="px-3 py-2 text-sm text-sidebar-foreground/70">
                  No chat history yet for {chatbot.category} chatbots
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Toggle Collapse Button */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-full h-8 w-8 mx-auto"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              !isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>
    </div>
  );
};