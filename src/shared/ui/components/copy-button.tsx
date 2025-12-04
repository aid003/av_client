'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './ui/button';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'default';
  variant?: 'ghost' | 'outline' | 'default';
}

export function CopyButton({
  text,
  size = 'sm',
  variant = 'ghost'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className="h-6 w-6 p-0"
      title={copied ? 'Скопировано!' : 'Копировать'}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}
