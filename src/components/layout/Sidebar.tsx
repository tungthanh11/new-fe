/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { CATEGORIES, mockChatbots } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ChevronRight, Grid2X2, Home, LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatbotCategory } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHistorySidebar } from './ChatHistorySidebar';

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentChat } = useChat();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ChatbotCategory | 'all'>('all');
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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

  const filteredChatbots = useMemo(() => {
    return activeCategory === 'all' 
      ? mockChatbots
      : mockChatbots.filter(bot => bot.category === activeCategory);
  }, [activeCategory]);

  // If we're on a chatbot page, show ONLY ChatHistorySidebar - không render gì khác
  if (isOnChatbotPage && selectedChatbot) {
    return (
      <div 
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <ChatHistorySidebar 
          chatbot={selectedChatbot}
          currentChatId={currentChatId}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>
    );
  }

  // Default sidebar for home page - chỉ render khi KHÔNG ở trang chatbot
  return (
    <div 
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar header */}
      <div className="h-16 flex items-center px-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex-1 flex items-center">
            <span className="font-bold text-lg">Cloudy Meowy Chatbot</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-full h-8 w-8 p-0"
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform", !isCollapsed && "rotate-180")} />
        </Button>
      </div>
      
      {/* Main navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Primary nav links */}
        <nav className="px-2 pt-3 space-y-1">
          <Link to="/">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location.pathname === "/" && "bg-sidebar-accent text-sidebar-accent-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <Home className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>Home</span>}
            </Button>
          </Link>
          <Link to="/chatbots">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location.pathname === "/chatbots" && "bg-sidebar-accent text-sidebar-accent-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <Grid2X2 className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>All Chatbots</span>}
            </Button>
          </Link>
        </nav>
        
        {/* Categories section */}
        {!isCollapsed && (
          <CategorySection 
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
        
        {/* Chatbot list */}
        {!isCollapsed && (
          <ChatbotList 
            activeCategory={activeCategory}
            filteredChatbots={filteredChatbots}
            currentPath={location.pathname}
          />
        )}
      </div>
      
      {/* User section - chỉ hiển thị trong default sidebar */}
      <UserSection 
        currentUser={currentUser} 
        logout={logout} 
        isCollapsed={isCollapsed} 
      />
    </div>
  );
};

// Separate components for better organization
const CategorySection: React.FC<{
  activeCategory: ChatbotCategory | 'all';
  setActiveCategory: (category: ChatbotCategory | 'all') => void;
}> = ({ activeCategory, setActiveCategory }) => (
  <>
    <div className="px-4 pt-4 pb-2">
      <h3 className="text-xs uppercase text-sidebar-foreground/60 font-semibold tracking-wider">
        Categories
      </h3>
    </div>
    <div className="px-2 space-y-1">
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          activeCategory === 'all' && "bg-sidebar-accent text-sidebar-accent-foreground"
        )}
        onClick={() => setActiveCategory('all')}
      >
        All Categories
      </Button>
      {Object.entries(CATEGORIES).map(([category, { color }]) => (
        <Button 
          key={category}
          variant="ghost" 
          className={cn(
            "w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            activeCategory === category && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
          onClick={() => setActiveCategory(category as ChatbotCategory)}
        >
          <span className={`w-2 h-2 rounded-full bg-${color} mr-2`}></span>
          {category}
        </Button>
      ))}
    </div>
  </>
);

const ChatbotList: React.FC<{
  activeCategory: ChatbotCategory | 'all';
  filteredChatbots: any[];
  currentPath: string;
}> = ({ activeCategory, filteredChatbots, currentPath }) => (
  <>
    <div className="px-4 pt-4 pb-2">
      <h3 className="text-xs uppercase text-sidebar-foreground/60 font-semibold tracking-wider">
        {activeCategory === 'all' ? 'Recent Chatbots' : `${activeCategory} Chatbots`}
      </h3>
    </div>
    <ScrollArea className="px-2 flex-1">
      <div className="space-y-1">
        {filteredChatbots.slice(0, 6).map((bot) => (
          <Link key={bot.id} to={`/chat/${bot.id}`}>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                currentPath === `/chat/${bot.id}` && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={bot.avatar} />
                <AvatarFallback className={`${bot.color} text-white`}>
                  {bot.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{bot.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  </>
);

const UserSection: React.FC<{
  currentUser: any;
  logout: () => void;
  isCollapsed: boolean;
}> = ({ currentUser, logout, isCollapsed }) => (
  <div className="h-16 flex items-center px-3 border-t border-sidebar-border">
    {!isCollapsed ? (
      <>
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser?.avatar} />
          <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="ml-2 flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{currentUser?.name}</p>
          <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser?.email}</p>
        </div>
        <div className="flex items-center gap-1">
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
      </>
    ) : (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => logout()}
        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-full h-8 w-8 mx-auto"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    )}
  </div>
);