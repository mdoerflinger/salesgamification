/**
 * Azure Cognitive Services Speech-to-Text provider (stub).
 * Requires NEXT_PUBLIC_SPEECH_KEY and NEXT_PUBLIC_SPEECH_REGION.
 */
import type { VoiceProvider, VoiceProviderOptions } from './voice-provider'

export class AzureSpeechProvider implements VoiceProvider {
  onResult: ((transcript: string, isFinal: boolean) => void) | null = null
  onError: ((error: string) => void) | null = null
  onEnd: (() => void) | null = null

  isSupported(): boolean {
    // Azure Speech SDK is always available if credentials are configured
    const key = process.env.NEXT_PUBLIC_SPEECH_KEY
    const region = process.env.NEXT_PUBLIC_SPEECH_REGION
    return !!(key && region)
  }

  start(_options: VoiceProviderOptions = {}): void {
    // Stub: In production, initialize Azure Speech SDK SpeechRecognizer here
    this.onError?.(
      'Azure Speech provider is a stub. Implement with @azure/cognitiveservices-speech-sdk.'
    )
    this.onEnd?.()
  }

  stop(): void {
    // Stub: Stop Azure Speech recognition
  }
}
