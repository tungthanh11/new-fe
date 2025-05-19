
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { mockChatbots, CATEGORIES } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const topChatbots = [...mockChatbots].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 4);

  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        {/* Welcome section */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {currentUser?.name}!</h1>
          <p className="text-muted-foreground">Get help from specialized AI assistants in various domains</p>
        </section>
        
        {/* Popular chatbots */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Popular Chatbots</h2>
            <Button variant="outline" asChild>
              <Link to="/chatbots">View all</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topChatbots.map((chatbot) => (
              <Card key={chatbot.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chatbot.avatar} />
                      <AvatarFallback className={`${chatbot.color} text-white`}>
                        {chatbot.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{chatbot.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{chatbot.description}</p>
                      <div className="mt-2 flex items-center">
                        <span className={`w-2 h-2 rounded-full bg-${CATEGORIES[chatbot.category].color} mr-1`}></span>
                        <span className="text-xs text-muted-foreground">{chatbot.category}</span>
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
        </section>
        
        {/* Categories */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(CATEGORIES).map(([category, { color, description }]) => (
              <Link key={category} to={`/chatbots?category=${category}`}>
                <Card className={`bg-${color}/10 hover:bg-${color}/20 transition-colors cursor-pointer h-full`}>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <div className={`w-12 h-12 rounded-full bg-${color} mb-3 flex items-center justify-center text-white`}>
                      {category.charAt(0)}
                    </div>
                    <h3 className="font-medium">{category}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Home;
