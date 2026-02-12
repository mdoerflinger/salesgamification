'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LeadForm } from '@/components/leads/lead-form'
import { VoiceDialog } from '@/components/voice/voice-dialog'
import { useCreateLead } from '@/lib/leads/hooks'
import { useGamification } from '@/lib/gamification/use-gamification'
import { ROUTES } from '@/lib/config/constants'
import type { LeadCreateDto } from '@/types/dataverse'
import type { VoiceIntent } from '@/types'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { mutate } from 'swr'

export default function NewLeadPage() {
  const router = useRouter()
  const { createLead, isCreating } = useCreateLead()
  const { awardXP } = useGamification()
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [voiceData, setVoiceData] = useState<Partial<LeadCreateDto>>({})
  const [showFollowUpPrompt, setShowFollowUpPrompt] = useState(false)
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null)

  const handleSubmit = async (data: LeadCreateDto) => {
    try {
      const result = await createLead(data)
      
      setCreatedLeadId(result.leadid)
      
      // Invalidate leads cache to refresh the list
      mutate((key) => typeof key === 'string' && key.startsWith('leads'))
      
      awardXP('create_lead', `Created lead: ${data.companyname}`)
      toast.success('Lead created successfully!')
      setShowFollowUpPrompt(true)
    } catch (err) {
      console.error('[v0] Failed to create lead:', err)
      toast.error('Failed to create lead')
    }
  }

  const handleVoiceIntent = (intent: VoiceIntent) => {
    if (intent.type === 'create_lead') {
      setVoiceData({
        firstname: intent.data.firstname || '',
        lastname: intent.data.lastname || '',
        companyname: intent.data.companyname || '',
        emailaddress1: intent.data.emailaddress1 || '',
      })
      toast.success('Voice data populated into form')
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Quick Add Lead"
        description="Capture a new lead in under 30 seconds."
        actions={
          <Button
            variant="outline"
            onClick={() => setVoiceOpen(true)}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Use Voice
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Details</CardTitle>
            <CardDescription>
              Fill in the essential fields. Only company name is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeadForm
              initialData={voiceData}
              onSubmit={handleSubmit}
              isSubmitting={isCreating}
              submitLabel="Create Lead"
            />
          </CardContent>
        </Card>
      </div>

      <VoiceDialog
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        onConfirmIntent={handleVoiceIntent}
      />

      {/* Follow-up prompt after successful creation */}
      <Dialog open={showFollowUpPrompt} onOpenChange={setShowFollowUpPrompt}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Lead Created!</DialogTitle>
            <DialogDescription>
              Would you like to schedule a follow-up for this lead?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowFollowUpPrompt(false)
                router.push(ROUTES.LEADS)
              }}
            >
              Skip
            </Button>
            <Button
              onClick={() => {
                setShowFollowUpPrompt(false)
                router.push(ROUTES.FOLLOW_UPS)
              }}
            >
              Schedule Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
