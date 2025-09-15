'use client';

import React from 'react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onThemeToggle, isDarkMode }) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              💰 投資リターン計算機
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              aria-label="テーマ切り替え"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};