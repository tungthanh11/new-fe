import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background">
      <div className="flex items-center">
        <h1 className="font-medium">Chatti Hubi Chatbots</h1>
      </div>
      <ThemeToggle />
    </header>
  );
};
