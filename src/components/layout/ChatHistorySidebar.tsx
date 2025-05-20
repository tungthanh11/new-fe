
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Chatbot, Chat } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, MessageSquare } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { format } from 'date-fns';

interface ChatHistorySidebarProps {
  chatbot: Chatbot;
  chatHistory: Chat[];
  currentChatId?: string;
  isCollapsed: boolean;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  chatbot,
  chatHistory,
  currentChatId,
  isCollapsed
}) => {
  const { createNewChat } = useChat();
  const navigate = useNavigate();

  const handleNewChat = () => {
    createNewChat(chatbot.id);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="h-16 flex items-center px-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex-1 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToHome}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-6 w-6 mr-2">
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
            "w-full gap-2 justify-start", 
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>
      
      {/* Chat History */}
      <ScrollArea className="flex-1">
        <div className={cn("py-2", isCollapsed ? "px-1" : "px-2")}>
          <div className={cn(!isCollapsed && "mb-2 px-2")}>
            {!isCollapsed && (
              <h3 className="text-xs uppercase text-sidebar-foreground/60 font-semibold tracking-wider">
                Chat History
              </h3>
            )}
          </div>
          
          <div className="space-y-1">
            {chatHistory.length > 0 ? (
              chatHistory
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                .map((chat) => (
                  <Link key={chat.id} to={`/chat/${chatbot.id}?chatId=${chat.id}`}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        currentChatId === chat.id && "bg-sidebar-accent text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      {isCollapsed ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <div className="truncate text-left">
                          <div className="font-medium truncate">
                            {chat.title || "New Chat"}
                          </div>
                          <div className="text-xs text-sidebar-foreground/70">
                            {format(chat.updatedAt, 'MMM d, h:mm a')}
                          </div>
                        </div>
                      )}
                    </Button>
                  </Link>
                ))
            ) : (
              !isCollapsed && (
                <div className="px-3 py-2 text-sm text-sidebar-foreground/70">
                  No chat history yet
                </div>
              )
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
