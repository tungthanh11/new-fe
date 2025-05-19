
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useChat } from '@/contexts/ChatContext';
import { mockChatbots } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentChatbot, currentChat, selectChatbot, sendMessage, isTyping } = useChat();
  const [inputValue, setInputValue] = useState('');
  const { currentUser } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Check if the chatbot exists
  useEffect(() => {
    if (id) {
      const chatbotExists = mockChatbots.some(bot => bot.id === id);
      if (chatbotExists) {
        selectChatbot(id);
      }
    }
  }, [id, selectChatbot]);
  
  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isTyping]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    if (message.isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      );
    }
    
    switch (message.type) {
      case 'code':
        return (
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                if (inline) {
                  return (
                    <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="chat-code-block" {...props}>
                    <code>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        );
      case 'markdown':
        return (
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-md font-bold my-1" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              p: ({ node, ...props }) => <p className="my-2" {...props} />,
              a: ({ node, ...props }) => <a className="text-primary underline" {...props} />,
              code: ({ node, inline, className, children, ...props }) => {
                if (inline) {
                  return (
                    <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="chat-code-block" {...props}>
                    <code>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        );
      default:
        return message.content;
    }
  };
  
  // Handle invalid chatbot ID
  if (id && !currentChatbot) {
    const chatbotExists = mockChatbots.some(bot => bot.id === id);
    if (!chatbotExists) {
      return <Navigate to="/chatbots" />;
    }
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }
  
  // No chatbot selected yet
  if (!currentChatbot || !currentChat) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold mb-2">Select a chatbot to start chatting</h2>
          <p className="text-muted-foreground mb-6">Choose from our specialized AI assistants</p>
          <Button asChild>
            <a href="/chatbots">Browse Chatbots</a>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {currentChat.messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="flex-shrink-0">
                    <Avatar className={`h-8 w-8 ${message.sender === 'user' ? 'ml-2' : 'mr-2'}`}>
                      {message.sender === 'user' ? (
                        <>
                          <AvatarImage src={currentUser?.avatar} />
                          <AvatarFallback>
                            {currentUser?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={currentChatbot.avatar} />
                          <AvatarFallback className={currentChatbot.color}>
                            {currentChatbot.name.charAt(0)}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === 'user' 
                        ? 'chat-message-user rounded-tr-none' 
                        : 'chat-message-bot rounded-tl-none'
                    }`}
                  >
                    <div>{renderMessageContent(message)}</div>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Invisible element for scrolling to bottom */}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input area */}
        <div className="border-t border-border p-4">
          <form 
            onSubmit={handleSubmit} 
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              disabled={isTyping}
              className="flex-1 bg-background border border-input rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
            />
            <Button type="submit" disabled={!inputValue.trim() || isTyping}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatInterface;
