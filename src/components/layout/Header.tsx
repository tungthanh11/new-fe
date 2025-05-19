
import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Trash } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentChatbot, clearChat } = useChat();
  
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background">
      <div className="flex items-center">
        {currentChatbot ? (
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentChatbot.avatar} />
              <AvatarFallback className={`${currentChatbot.color} text-white`}>
                {currentChatbot.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h1 className="font-medium">{currentChatbot.name}</h1>
              <p className="text-xs text-muted-foreground">{currentChatbot.category}</p>
            </div>
          </div>
        ) : (
          <h1 className="font-medium">AI Chat Assistant</h1>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {currentChatbot && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            className="text-muted-foreground"
          >
            <Trash className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};
