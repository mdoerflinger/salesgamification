'use client'

import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VoiceButtonProps {
  isListening: boolean
  onStart: () => void
  onStop: () => void
  className?: string
  size?: 'default' | 'lg'
}

export function VoiceButton({
  isListening,
  onStart,
  onStop,
  className,
  size = 'default',
}: VoiceButtonProps) {
  return (
    <Button
      variant={isListening ? 'destructive' : 'secondary'}
      size={size === 'lg' ? 'lg' : 'default'}
      onClick={isListening ? onStop : onStart}
      className={cn(
        'gap-2 transition-all',
        isListening && 'animate-pulse',
        className
      )}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Voice
        </>
      )}
    </Button>
  )
}
