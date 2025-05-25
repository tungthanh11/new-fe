import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chatbot, Chat } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, MessageSquare, ChevronRight } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { format } from "date-fns";

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
  const { createNewChat, getChatHistory } = useChat();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to convert category to lowercase (matching ChatContext)
  const getChatbotType = useCallback((category: string): string => {
    return category.toLowerCase();
  }, []);

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
        // Sort by updated_at/created_at with most recent first
        const sortedHistory = history.sort((a, b) => {
          const aTime = new Date(a.updatedAt || a.createdAt || a.createdAt);
          const bTime = new Date(b.updatedAt || b.createdAt || b.createdAt);
          return bTime.getTime() - aTime.getTime();
        });
        
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
  }, [chatbot, getChatHistory, getChatbotType]);

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

  const formatChatDate = useCallback((chat: Chat) => {
    try {
      const date = new Date(chat.updatedAt || chat.createdAt || chat.updatedAt || chat.createdAt);
      if (isNaN(date.getTime())) {
        return "Recently";
      }
      return format(date, "MMM d, h:mm a");
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Recently";
    }
  }, []);

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
                  
                  console.log('Rendering chat:', chatId, 'Active:', isActive, 'Current:', currentChatId);
                  
                  return (
                    <Link
                      key={chatId}
                      to={`/chat/${chatbot.id}?chatId=${chatId}`}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        {isCollapsed ? (
                          <MessageSquare className="h-4 w-4" />
                        ) : (
                          <div className="truncate text-left w-full">
                            <div className="font-medium truncate">
                              {chat.title || `Chat ${chatId.slice(-4)}`}
                            </div>
                            <div className="text-xs text-sidebar-foreground/70">
                              {formatChatDate(chat)}
                            </div>
                          </div>
                        )}
                      </Button>
                    </Link>
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