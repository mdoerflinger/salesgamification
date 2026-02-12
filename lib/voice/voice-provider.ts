/**
 * Abstract voice provider interface.
 */

export interface VoiceProviderOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

export interface VoiceProvider {
  start(options?: VoiceProviderOptions): void
  stop(): void
  isSupported(): boolean
  onResult: ((transcript: string, isFinal: boolean) => void) | null
  onError: ((error: string) => void) | null
  onEnd: (() => void) | null
}
