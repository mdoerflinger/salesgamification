'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { VoiceIntent, VoiceState } from '@/types'
import type { VoiceProvider } from './voice-provider'
import { WebSpeechProvider } from './web-speech-provider'
import { MockVoiceProvider } from './mock-voice-provider'
import { parseVoiceIntent } from './intent-parser'
import { env } from '@/lib/config/env'

/**
 * Hook for voice recognition with intent parsing.
 */
export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    intent: null,
    error: null,
  })

  const providerRef = useRef<VoiceProvider | null>(null)

  // Initialize provider
  useEffect(() => {
    if (env.useMockVoice()) {
      providerRef.current = new MockVoiceProvider()
    } else {
      const webSpeech = new WebSpeechProvider()
      if (webSpeech.isSupported()) {
        providerRef.current = webSpeech
      } else {
        providerRef.current = new MockVoiceProvider()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    const provider = providerRef.current
    if (!provider) return

    setState({
      isListening: true,
      transcript: '',
      interimTranscript: '',
      intent: null,
      error: null,
    })

    provider.onResult = (transcript: string, isFinal: boolean) => {
      if (isFinal) {
        const intent = parseVoiceIntent(transcript)
        setState((prev) => ({
          ...prev,
          transcript,
          interimTranscript: '',
          intent,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          interimTranscript: transcript,
        }))
      }
    }

    provider.onError = (error: string) => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        error,
      }))
    }

    provider.onEnd = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
      }))
    }

    provider.start({
      language: 'en-US',
      continuous: false,
      interimResults: true,
    })
  }, [])

  const stopListening = useCallback(() => {
    providerRef.current?.stop()
    setState((prev) => ({
      ...prev,
      isListening: false,
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      isListening: false,
      transcript: '',
      interimTranscript: '',
      intent: null,
      error: null,
    })
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    reset,
    isSupported: providerRef.current?.isSupported() ?? false,
  }
}
