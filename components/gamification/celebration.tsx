'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/hooks/use-window-size'
import { Sparkles, Trophy, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CelebrationType = 'xp' | 'level-up' | 'badge' | 'streak'

interface CelebrationProps {
  type: CelebrationType
  title: string
  description?: string
  show: boolean
  onComplete?: () => void
}

const CELEBRATION_CONFIG = {
  'xp': {
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    confettiColors: ['#3B82F6', '#60A5FA', '#93C5FD'],
    pieces: 100,
    duration: 2000,
  },
  'level-up': {
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    confettiColors: ['#EAB308', '#FBBF24', '#FCD34D', '#FDE047'],
    pieces: 200,
    duration: 4000,
  },
  'badge': {
    icon: Trophy,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    confettiColors: ['#A855F7', '#C084FC', '#E9D5FF'],
    pieces: 150,
    duration: 3000,
  },
  'streak': {
    icon: Star,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    confettiColors: ['#F97316', '#FB923C', '#FDBA74'],
    pieces: 120,
    duration: 2500,
  },
}

export function Celebration({ type, title, description, show, onComplete }: CelebrationProps) {
  const { width, height } = useWindowSize()
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const config = CELEBRATION_CONFIG[type]
  const Icon = config.icon

  useEffect(() => {
    if (show) {
      // Play sound
      playSound(type)
      
      // Show confetti immediately
      setShowConfetti(true)
      
      // Show modal with slight delay for dramatic effect
      setTimeout(() => setIsVisible(true), 100)

      // Hide confetti after duration
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false)
      }, config.duration)

      // Hide modal and complete
      const modalTimer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onComplete?.()
        }, 300)
      }, config.duration - 500)

      return () => {
        clearTimeout(confettiTimer)
        clearTimeout(modalTimer)
      }
    }
  }, [show, type, config.duration, onComplete])

  if (!show) return null

  return (
    <>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={config.pieces}
          colors={config.confettiColors}
          gravity={0.3}
        />
      )}

      {/* Modal Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div
          className={cn(
            'relative flex flex-col items-center gap-4 rounded-2xl border p-8 shadow-2xl transition-all duration-500',
            config.bgColor,
            'bg-card',
            isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          )}
        >
          {/* Icon with pulse animation */}
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full animate-pulse',
              config.bgColor
            )}
          >
            <Icon className={cn('h-10 w-10', config.color)} />
          </div>

          {/* Title */}
          <h2 className="text-center text-3xl font-bold font-heading">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-center text-muted-foreground max-w-sm">
              {description}
            </p>
          )}

          {/* Sparkles decoration */}
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Sparkles className={cn('h-6 w-6', config.color)} />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce delay-150">
            <Star className={cn('h-5 w-5', config.color)} />
          </div>
        </div>
      </div>
    </>
  )
}

// Sound effects using Web Audio API
function playSound(type: CelebrationType) {
  if (typeof window === 'undefined') return

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    if (type === 'level-up') {
      playLevelUpSound(audioContext)
    } else if (type === 'badge') {
      playBadgeSound(audioContext)
    } else if (type === 'streak') {
      playStreakSound(audioContext)
    } else {
      playXPSound(audioContext)
    }
  } catch (error) {
    console.warn('[v0] Audio playback failed:', error)
  }
}

function playLevelUpSound(ctx: AudioContext) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  // Ascending notes
  osc.frequency.setValueAtTime(523.25, now) // C5
  osc.frequency.setValueAtTime(659.25, now + 0.1) // E5
  osc.frequency.setValueAtTime(783.99, now + 0.2) // G5
  osc.frequency.setValueAtTime(1046.50, now + 0.3) // C6

  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

  osc.start(now)
  osc.stop(now + 0.5)
}

function playBadgeSound(ctx: AudioContext) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, now)
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1)

  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

  osc.start(now)
  osc.stop(now + 0.3)
}

function playStreakSound(ctx: AudioContext) {
  const now = ctx.currentTime
  
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const startTime = now + i * 0.1
    osc.frequency.setValueAtTime(800 + i * 200, startTime)
    
    gain.gain.setValueAtTime(0.15, startTime)
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1)

    osc.start(startTime)
    osc.stop(startTime + 0.1)
  }
}

function playXPSound(ctx: AudioContext) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.1)

  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

  osc.start(now)
  osc.stop(now + 0.15)
}
