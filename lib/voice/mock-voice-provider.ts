/**
 * Mock voice provider for development without a microphone.
 */
import type { VoiceProvider, VoiceProviderOptions } from './voice-provider'

const MOCK_TRANSCRIPTS = [
  'Create a lead for John Smith at Acme Corp',
  'Add a note discussed pricing options',
  'Schedule a follow-up call for Friday',
  'Create lead Sarah Johnson from TechStart Inc email sarah@techstart.com',
  'Set up a meeting with the new prospect next Tuesday',
  'Advance opportunity to Angebot',
  'Move opportunity to Verhandlung',
]

export class MockVoiceProvider implements VoiceProvider {
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  onResult: ((transcript: string, isFinal: boolean) => void) | null = null
  onError: ((error: string) => void) | null = null
  onEnd: (() => void) | null = null

  isSupported(): boolean {
    return true
  }

  start(_options: VoiceProviderOptions = {}): void {
    const transcript =
      MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)]

    // Simulate progressive recognition
    let currentIndex = 0
    const words = transcript.split(' ')

    const emitWord = () => {
      if (currentIndex < words.length) {
        const partial = words.slice(0, currentIndex + 1).join(' ')
        this.onResult?.(partial, false)
        currentIndex++
        this.timeoutId = setTimeout(emitWord, 200 + Math.random() * 300)
      } else {
        this.onResult?.(transcript, true)
        this.onEnd?.()
      }
    }

    this.timeoutId = setTimeout(emitWord, 500)
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.onEnd?.()
  }
}
