'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Bot } from 'lucide-react';
import { SpecularButton } from '@/src/components/ui/SpecularButton';
import { getPageAiContext, openPageAiChatbot, PageAiContext } from '@/src/lib/pageAiConfig';

interface PageAiSpecularButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  customLabel?: string;
  customPrompt?: string;
}

export const PageAiSpecularButton: React.FC<PageAiSpecularButtonProps> = () => {
  return null;
};

export default PageAiSpecularButton;
