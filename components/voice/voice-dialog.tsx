'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ds/status-badge'
import { VoiceButton } from './voice-button'
import { useVoice } from '@/lib/voice/use-voice'
import { Mic } from 'lucide-react'
import type { VoiceIntent } from '@/types'

interface VoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmIntent?: (intent: VoiceIntent) => void
}

export function VoiceDialog({ open, onOpenChange, onConfirmIntent }: VoiceDialogProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    intent,
    error,
    startListening,
    stopListening,
    reset,
  } = useVoice()

  const handleClose = () => {
    stopListening()
    reset()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (intent && intent.type !== 'unknown') {
      onConfirmIntent?.(intent)
      handleClose()
    }
  }

  const intentLabels: Record<string, string> = {
    create_lead: 'Create Lead',
    add_note: 'Add Note',
    schedule_followup: 'Schedule Follow-up',
    unknown: 'Unknown',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Command
          </DialogTitle>
          <DialogDescription>
            Speak a command like "Create a lead for John Smith at Acme Corp"
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <VoiceButton
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
            size="lg"
          />

          {/* Transcript display */}
          <div className="min-h-16 w-full rounded-md border bg-muted/50 p-3">
            {isListening && !transcript && !interimTranscript && (
              <p className="text-center text-sm text-muted-foreground italic">
                Listening...
              </p>
            )}
            {interimTranscript && !transcript && (
              <p className="text-sm text-muted-foreground">{interimTranscript}</p>
            )}
            {transcript && (
              <p className="text-sm text-foreground">{transcript}</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Parsed intent */}
          {intent && intent.type !== 'unknown' && (
            <div className="w-full rounded-md border border-success/20 bg-success/5 p-3">
              <div className="flex items-center gap-2">
                <StatusBadge status="success">
                  {intentLabels[intent.type]}
                </StatusBadge>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {Object.entries(intent.data).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">{key}:</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {intent && intent.type === 'unknown' && transcript && (
            <p className="text-sm text-muted-foreground">
              Could not parse a command. Try "Create a lead for..." or "Schedule a follow-up..."
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!intent || intent.type === 'unknown'}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
