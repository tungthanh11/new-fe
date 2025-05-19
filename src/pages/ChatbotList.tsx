
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockChatbots, CATEGORIES } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatbotCategory } from '@/types';
import { Search } from 'lucide-react';

const ChatbotList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ChatbotCategory | null;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ChatbotCategory | 'all'>(categoryParam || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter chatbots based on search term and category
  const filteredChatbots = mockChatbots.filter(chatbot => {
    const matchesSearch = searchTerm === '' || 
      chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      chatbot.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || chatbot.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">All Chatbots</h1>
            <p className="text-muted-foreground">Browse and chat with specialized AI assistants</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search chatbots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Categories filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            All Categories
          </Button>
          {Object.entries(CATEGORIES).map(([category]) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category as ChatbotCategory)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* View mode toggle */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{filteredChatbots.length} chatbots found</p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>
        
        {/* Chatbots grid/list */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredChatbots.map((chatbot) => (
              <Card key={chatbot.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chatbot.avatar} />
                      <AvatarFallback className={`${chatbot.color} text-white`}>
                        {chatbot.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{chatbot.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{chatbot.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline">{chatbot.category}</Badge>
                        <span className="text-xs text-muted-foreground">{chatbot.usageCount?.toLocaleString()} users</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" asChild>
                      <Link to={`/chat/${chatbot.id}`}>Chat Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChatbots.map((chatbot) => (
              <Card key={chatbot.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={chatbot.avatar} />
                      <AvatarFallback className={`${chatbot.color} text-white`}>
                        {chatbot.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{chatbot.name}</h3>
                        <Badge variant="outline" className="ml-2">{chatbot.category}</Badge>
                        <span className="text-xs text-muted-foreground">{chatbot.usageCount?.toLocaleString()} users</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{chatbot.description}</p>
                    </div>
                    <Button className="shrink-0" asChild>
                      <Link to={`/chat/${chatbot.id}`}>Chat Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {filteredChatbots.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No chatbots found</h3>
            <p className="text-muted-foreground">Try a different search term or category</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChatbotList;
