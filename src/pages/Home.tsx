import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockChatbots, CATEGORIES } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ChefHat,
  Scale,
  Heart,
  Code,
  Briefcase,
  FlaskConical,
} from "lucide-react";
import { ChatbotCategory } from "@/types";

// Map categories to icons
const categoryIcons: Record<ChatbotCategory, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  cook: ChefHat,
  law: Scale,
  medical: Heart,
  programming: Code,
  business: Briefcase,
  science: FlaskConical,
};

// Map color names to hex values
const colorMap: Record<string, string> = {
  "chatbot-blue": "#4285F4",
  "chatbot-green": "#34A853",
  "chatbot-red": "#EA4335",
  "chatbot-purple": "#9b87f5",
  "chatbot-yellow": "#FBBC05",
  "chatbot-teal": "#00ACC1",
};

// Helper function to get color with opacity
const getColorWithOpacity = (colorName: string, opacity: number): string => {
  const hex = colorMap[colorName] || "#000000";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const sortedChatbots = [...mockChatbots].sort(
    (a, b) => (b.usageCount || 0) - (a.usageCount || 0)
  );
  const legalEagleIndex = sortedChatbots.findIndex(
    (bot) => bot.id === "chatbot-2"
  );
  if (legalEagleIndex > -1) {
    const [legalEagle] = sortedChatbots.splice(legalEagleIndex, 1);
    sortedChatbots.unshift(legalEagle);
  }
  const topChatbots = sortedChatbots.slice(0, 6);

  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        {/* Welcome section */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {currentUser?.name}!
          </h1>
          <p className="text-muted-foreground">
            Get help from specialized AI assistants in various domains
          </p>
        </section>

        {/* Popular chatbots */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Recent Chatbots</h2>
            <Button variant="outline" asChild>
              <Link to="/chatbots">View all</Link>
            </Button>
          </div>

          <div className="relative px-8 md:px-12 lg:px-16 py-4" style={{ overflowX: 'hidden' }}>
            <Carousel
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 1,
                // dragFree: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {topChatbots.map((chatbot) => {
                  const CategoryIcon = categoryIcons[chatbot.category];
                  return (
                    <CarouselItem
                      key={chatbot.id}
                      className="pl-4 md:pl-6 basis-full md:basis-1/2 lg:basis-[33.333%]"
                    >
                      <Card
                        className="overflow-hidden border-2 border-primary/20 dark:border-white/30 shadow-lg transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl hover:border-primary/50 dark:hover:border-white/50 h-full dark:bg-white/8 relative hover:z-50"
                        style={{
                          background:
                            theme === 'dark'
                              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)"
                              : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 250, 240, 0.5) 100%)",
                          backdropFilter: theme === 'dark' ? "blur(10px) saturate(150%)" : "blur(16px) saturate(180%)",
                          WebkitBackdropFilter: theme === 'dark' ? "blur(10px) saturate(150%)" : "blur(16px) saturate(180%)",
                        }}
                        onMouseEnter={(e) => {
                          if (theme === 'dark') {
                            const target = e.currentTarget as HTMLElement;
                            target.style.backdropFilter = "blur(6px) saturate(140%)";
                            (target.style as any).webkitBackdropFilter = "blur(6px) saturate(140%)";
                            target.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (theme === 'dark') {
                            const target = e.currentTarget as HTMLElement;
                            target.style.backdropFilter = "blur(10px) saturate(150%)";
                            (target.style as any).webkitBackdropFilter = "blur(10px) saturate(150%)";
                            target.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                          }
                        }}
                      >
                        <CardContent className="p-6 md:p-8 lg:p-10 min-h-[280px] flex flex-col justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="relative">
                              <Avatar className="h-14 w-14 ring-2 ring-primary/30 dark:ring-white/20">
                                <AvatarImage src={chatbot.avatar} />
                                <AvatarFallback
                                  className={`${chatbot.color} text-white`}
                                >
                                  {chatbot.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className="absolute -bottom-1 -right-1 p-1.5 rounded-full backdrop-blur-sm"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                                  border: "1px solid rgba(255, 255, 255, 0.8)",
                                }}
                              >
                                <CategoryIcon 
                                  className="h-4 w-4"
                                  style={{ 
                                    color: colorMap[CATEGORIES[chatbot.category].color] 
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 dark:text-white">
                                {chatbot.name}
                              </h3>
                              <p className="text-sm text-muted-foreground dark:text-gray-300 line-clamp-2 mb-3">
                                {chatbot.description}
                              </p>
                              <div className="flex items-center gap-2 mb-4">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      colorMap[
                                        CATEGORIES[chatbot.category].color
                                      ],
                                  }}
                                ></span>
                                <span className="text-xs text-muted-foreground dark:text-gray-400 capitalize">
                                  {chatbot.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            className="w-full backdrop-blur-sm border border-primary/40 dark:border-white/40 hover:bg-primary/20 dark:hover:bg-white/15 transition-all font-semibold shadow-sm"
                            style={{
                              backgroundColor: theme === 'dark' ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.4)",
                              color: theme === 'dark' ? "#ffffff" : "hsl(var(--primary))",
                            }}
                            asChild
                          >
                            <Link 
                              to={`/chat/${chatbot.id}`} 
                              style={{ 
                                color: theme === 'dark' ? "#ffffff" : "hsl(var(--primary))" 
                              }}
                            >
                              Chat Now
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-2 md:left-4 bg-white/60 dark:bg-white/5 backdrop-blur-md border-2 border-primary/30 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary/50 dark:hover:border-white/20 shadow-lg text-foreground hover:text-foreground h-10 w-10" />
              <CarouselNext className="right-2 md:right-4 bg-white/60 dark:bg-white/5 backdrop-blur-md border-2 border-primary/30 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary/50 dark:hover:border-white/20 shadow-lg text-foreground hover:text-foreground h-10 w-10" />
            </Carousel>
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(CATEGORIES).map(
              ([category, { color, description }]) => {
                const CategoryIcon = categoryIcons[category as ChatbotCategory];
                const categoryColor = colorMap[color];
                return (
                  <Link key={category} to={`/chatbots?category=${category}`}>
                    <Card
                      className="transition-all duration-300 cursor-pointer h-full hover:scale-[1.005] hover:shadow-md"
                      style={{
                        backgroundColor: getColorWithOpacity(color, 0.1),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          getColorWithOpacity(color, 0.2);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          getColorWithOpacity(color, 0.1);
                      }}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                        <div
                          className="w-12 h-12 rounded-full mb-3 flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: getColorWithOpacity(color, 0.2),
                            border: `2px solid ${categoryColor}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              getColorWithOpacity(color, 0.3);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              getColorWithOpacity(color, 0.2);
                          }}
                        >
                          <CategoryIcon
                            className="w-6 h-6"
                            style={{ 
                              color: categoryColor,
                              strokeWidth: 2
                            }}
                          />
                        </div>
                        <h3 className="font-medium capitalize">{category}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              }
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Home;
