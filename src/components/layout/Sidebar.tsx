/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { CATEGORIES, mockChatbots } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Grid2X2, Home, LogOut, Settings, ChefHat, Scale, Heart, Code, Briefcase, FlaskConical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatbotCategory } from '@/types';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Map color names to hex values
const colorMap: Record<string, string> = {
  "chatbot-blue": "#4285F4",
  "chatbot-green": "#34A853",
  "chatbot-red": "#EA4335",
  "chatbot-purple": "#9b87f5",
  "chatbot-yellow": "#FBBC05",
  "chatbot-teal": "#00ACC1",
};

// Map categories to icons
const categoryIcons: Record<ChatbotCategory, React.ComponentType<{ className?: string }>> = {
  cook: ChefHat,
  law: Scale,
  medical: Heart,
  programming: Code,
  business: Briefcase,
  science: FlaskConical,
};

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentChat } = useChat();
  const location = useLocation();
  const [isChatHistoryCollapsed, setIsChatHistoryCollapsed] = useState(false);

  // Parse current route information
  const { isOnChatbotPage, selectedChatbot, currentChatId } = useMemo(() => {
    const pathParts = location.pathname.split('/');
    const chatbotId = pathParts[1] === 'chat' && pathParts[2] ? pathParts[2] : null;
      
    const chatbot = chatbotId
      ? mockChatbots.find(bot => bot.id === chatbotId) || null
      : null;
      
    const searchParams = new URLSearchParams(location.search);
    const chatId = searchParams.get('chatId') || currentChat?.chatId || currentChat?.id || undefined;
      
    return {
      isOnChatbotPage: Boolean(chatbot && location.pathname.startsWith('/chat/')),
      selectedChatbot: chatbot,
      currentChatId: chatId
    };
  }, [location.pathname, location.search, currentChat]);

  // If we're on a chatbot page, show ONLY ChatHistorySidebar
  if (isOnChatbotPage && selectedChatbot) {
    return (
      <div className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        isChatHistoryCollapsed ? "w-16" : "w-64"
      )}>
        <ChatHistorySidebar 
          chatbot={selectedChatbot}
          currentChatId={currentChatId}
          isCollapsed={isChatHistoryCollapsed}
          onToggleCollapse={() => setIsChatHistoryCollapsed(!isChatHistoryCollapsed)}
        />
      </div>
    );
  }

  // Rail Sidebar - always compact with icon + short name
  return (
    <div className="flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-20">
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <span className="font-bold text-sm">Menu</span>
      </div>
      
      {/* Main navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto py-2">
        {/* Primary nav links */}
        <nav className="px-2 space-y-2">
          <Link to="/">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "w-full flex-col h-auto py-2 px-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location.pathname === "/" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link to="/chatbots">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "w-full flex-col h-auto py-2 px-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location.pathname === "/chatbots" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Grid2X2 className="h-5 w-5 mb-1" />
              <span className="text-xs">All</span>
            </Button>
          </Link>
        </nav>

        {/* Divider */}
        <div className="px-2 py-2">
          <div className="h-px bg-sidebar-border" />
        </div>
        
        {/* Categories with Popover */}
        <nav className="px-2 space-y-2">
          {Object.entries(CATEGORIES).map(([category, { color, description }]) => {
            const CategoryIcon = categoryIcons[category as ChatbotCategory];
            const categoryChatbots = mockChatbots.filter(bot => bot.category === category);
            
            return (
              <CategoryPopover
                key={category}
                category={category as ChatbotCategory}
                color={color}
                description={description}
                icon={CategoryIcon}
                chatbots={categoryChatbots}
                currentPath={location.pathname}
              />
            );
          })}
        </nav>
      </div>
      
      {/* User section */}
      <div className="h-16 flex flex-col items-center justify-center border-t border-sidebar-border py-2 space-y-1">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-full h-8 w-8"
        >
          <Link to="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => logout()}
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-full h-8 w-8"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Category Popover Component
const CategoryPopover: React.FC<{
  category: ChatbotCategory;
  color: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  chatbots: any[];
  currentPath: string;
}> = ({ category, color, description, icon: Icon, chatbots, currentPath }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full flex-col h-auto py-2 px-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="relative">
            <Icon className="h-5 w-5 mb-1" />
            <span 
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: colorMap[color] }}
            />
          </div>
          <span className="text-xs capitalize truncate w-full">{category}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start"
        className="w-64 p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-1">
          <div className="px-2 py-1.5 border-b border-border mb-2">
            <h4 className="font-semibold text-sm capitalize">{category}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {chatbots.length > 0 ? (
              chatbots.map((bot) => (
                <Link 
                  key={bot.id} 
                  to={`/chat/${bot.id}`}
                  onClick={() => setOpen(false)}
                >
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start h-auto py-2 px-2 hover:bg-accent",
                      currentPath === `/chat/${bot.id}` && "bg-accent"
                    )}
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={bot.avatar} />
                      <AvatarFallback className={`${bot.color} text-white text-xs`}>
                        {bot.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{bot.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{bot.description}</p>
                    </div>
                  </Button>
                </Link>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No chatbots in this category
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
