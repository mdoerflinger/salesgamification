/**
 * Lightweight intent parser for voice commands.
 * Extracts structured data from natural language transcripts.
 */
import type { VoiceIntent, VoiceIntentType } from '@/types'

interface IntentPattern {
  type: VoiceIntentType
  patterns: RegExp[]
  extract: (match: RegExpMatchArray, raw: string) => Record<string, string>
}

const PHASE_NAME_MAP: Record<string, number> = {
  'neu': 1,
  'in verhandlung': 2,
  'verhandlung': 2,
  'angebot': 3,
  'gewonnen': 4,
}

function resolvePhase(input: string): number | null {
  const lower = input.toLowerCase().trim()
  return PHASE_NAME_MAP[lower] ?? null
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    type: 'create_lead',
    patterns: [
      /create\s+(?:a\s+)?lead\s+(?:for\s+)?(.+)/i,
      /new\s+lead\s+(?:for\s+)?(.+)/i,
      /add\s+(?:a\s+)?lead\s+(?:for\s+)?(.+)/i,
    ],
    extract: (_match, raw) => {
      const data: Record<string, string> = {}

      // Try to extract "firstname lastname at/from company"
      const nameCompanyMatch = raw.match(
        /(?:for\s+)?(\w+)\s+(\w+)\s+(?:at|from)\s+(.+?)(?:\s+email\s+(.+?))?$/i
      )
      if (nameCompanyMatch) {
        data.firstname = nameCompanyMatch[1]
        data.lastname = nameCompanyMatch[2]
        data.companyname = nameCompanyMatch[3].replace(/\s+email\s+.+$/i, '').trim()
        if (nameCompanyMatch[4]) {
          data.emailaddress1 = nameCompanyMatch[4].trim()
        }
        return data
      }

      // Try "name at company"
      const simpleMatch = raw.match(
        /(?:for\s+)?(.+?)\s+(?:at|from)\s+(.+)/i
      )
      if (simpleMatch) {
        const nameParts = simpleMatch[1].trim().split(/\s+/)
        if (nameParts.length >= 2) {
          data.firstname = nameParts[0]
          data.lastname = nameParts.slice(1).join(' ')
        } else {
          data.lastname = nameParts[0]
        }
        data.companyname = simpleMatch[2].trim()
        return data
      }

      // Fallback: treat entire content as company name
      const afterKeyword = raw.replace(/^.*?lead\s+(?:for\s+)?/i, '').trim()
      data.companyname = afterKeyword
      return data
    },
  },
  {
    type: 'add_note',
    patterns: [
      /add\s+(?:a\s+)?note\s*[:\s]*(.+)/i,
      /note\s*[:\s]+(.+)/i,
    ],
    extract: (match) => ({
      description: match[1]?.trim() || '',
    }),
  },
  {
    type: 'schedule_followup',
    patterns: [
      /schedule\s+(?:a\s+)?follow[- ]?up\s+(.+)/i,
      /set\s+up\s+(?:a\s+)?(?:meeting|call)\s+(.+)/i,
      /follow[- ]?up\s+(?:call|email|meeting)\s+(.+)/i,
    ],
    extract: (_match, raw) => {
      const data: Record<string, string> = {}

      // Extract channel
      if (/call/i.test(raw)) data.channel = 'call'
      else if (/email/i.test(raw)) data.channel = 'email'
      else if (/meeting/i.test(raw)) data.channel = 'meeting'
      else data.channel = 'other'

      // Extract date references
      const dateMatch = raw.match(
        /(?:for|on|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)/i
      )
      if (dateMatch) {
        data.dateHint = dateMatch[1].toLowerCase()
        data.scheduledstart = resolveDateHint(data.dateHint)
      }

      // Extract subject
      const subjectMatch = raw.replace(/^.*?follow[- ]?up\s*/i, '').trim()
      data.subject = subjectMatch || `Follow-up ${data.channel || 'call'}`

      return data
    },
  },
  {
    type: 'change_opportunity_phase',
    patterns: [
      /(?:advance|move|set)\s+(?:the\s+)?opportunity\s+(?:to|phase)\s+(.+)/i,
      /(?:opportunity|opp)\s+(?:to|nach|auf)\s+(.+)/i,
      /phase\s+(?:aendern|wechseln|setzen)\s+(?:auf|nach|zu)\s+(.+)/i,
    ],
    extract: (_match, raw) => {
      const data: Record<string, string> = {}
      const phaseMatch = raw.match(/(?:to|nach|auf|zu)\s+(.+?)$/i)
      if (phaseMatch) {
        const phaseName = phaseMatch[1].trim()
        const phaseNumber = resolvePhase(phaseName)
        if (phaseNumber !== null) {
          data.phase = String(phaseNumber)
          data.phaseName = phaseName
        }
      }
      return data
    },
  },
]

/**
 * Parse a voice transcript into a structured intent.
 */
export function parseVoiceIntent(transcript: string): VoiceIntent {
  const cleaned = transcript.trim()

  for (const pattern of INTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      const match = cleaned.match(regex)
      if (match) {
        return {
          type: pattern.type,
          confidence: 0.8,
          data: pattern.extract(match, cleaned),
          rawTranscript: cleaned,
        }
      }
    }
  }

  return {
    type: 'unknown',
    confidence: 0,
    data: {},
    rawTranscript: cleaned,
  }
}

/**
 * Resolve a natural language date hint to an ISO date string.
 */
function resolveDateHint(hint: string): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)

  if (hint === 'today') return today.toISOString()
  if (hint === 'tomorrow') {
    today.setDate(today.getDate() + 1)
    return today.toISOString()
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const targetDay = dayNames.indexOf(hint)
  if (targetDay >= 0) {
    const currentDay = now.getDay()
    let daysUntil = targetDay - currentDay
    if (daysUntil <= 0) daysUntil += 7
    today.setDate(today.getDate() + daysUntil)
    return today.toISOString()
  }

  // Default: tomorrow
  today.setDate(today.getDate() + 1)
  return today.toISOString()
}
