/**
 * Web Speech API implementation for voice recognition.
 * Uses the browser-native SpeechRecognition API.
 */
import type { VoiceProvider, VoiceProviderOptions } from './voice-provider'

export class WebSpeechProvider implements VoiceProvider {
  private recognition: SpeechRecognition | null = null
  onResult: ((transcript: string, isFinal: boolean) => void) | null = null
  onError: ((error: string) => void) | null = null
  onEnd: (() => void) | null = null

  isSupported(): boolean {
    if (typeof window === 'undefined') return false
    return !!(
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    )
  }

  start(options: VoiceProviderOptions = {}): void {
    if (!this.isSupported()) {
      this.onError?.('Speech recognition is not supported in this browser')
      return
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition })
        .webkitSpeechRecognition

    this.recognition = new SpeechRecognitionClass()
    this.recognition.lang = options.language || 'en-US'
    this.recognition.continuous = options.continuous ?? false
    this.recognition.interimResults = options.interimResults ?? true
    this.recognition.maxAlternatives = 1

    this.recognition.onresult = (event) => {
      let transcript = ''
      let isFinal = false

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
        if (event.results[i].isFinal) {
          isFinal = true
        }
      }

      this.onResult?.(transcript, isFinal)
    }

    this.recognition.onerror = (event) => {
      this.onError?.(event.error)
    }

    this.recognition.onend = () => {
      this.onEnd?.()
    }

    this.recognition.start()
  }

  stop(): void {
    this.recognition?.stop()
    this.recognition = null
  }
}
