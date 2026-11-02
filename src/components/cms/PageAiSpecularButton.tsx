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

export const PageAiSpecularButton: React.FC<PageAiSpecularButtonProps> = ({
  size = 'sm',
  className = '',
  customLabel,
  customPrompt,
}) => {
  const pathname = usePathname();
  const pageAi = getPageAiContext(pathname);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openPageAiChatbot(pathname, customPrompt);
  };

  const label = customLabel || pageAi.buttonLabel;

  return (
    <SpecularButton
      size={size}
      onClick={handleClick}
      tint="#00e5ff"
      tintOpacity={0.12}
      lineColor="#00e5ff"
      baseColor="#38bdf8"
      textColor="#ffffff"
      intensity={1.3}
      idleIntensity={0.5}
      glow={1.3}
      radius={12}
      title={`Open ${pageAi.specialistRole} for ${pageAi.pageTitle}`}
      className={`group font-bold tracking-tight shadow-lg transition-all ${className}`}
    >
      <span className="flex items-center gap-1.5 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse group-hover:rotate-12 transition-transform shrink-0" />
        <span className="font-extrabold tracking-wide text-white group-hover:text-[#00e5ff] transition-colors whitespace-nowrap">
          {label}
        </span>
      </span>
    </SpecularButton>
  );
};

export default PageAiSpecularButton;
