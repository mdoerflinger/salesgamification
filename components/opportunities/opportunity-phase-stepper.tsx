'use client'

import { useState } from 'react'
import { Stepper, type StepperStep } from '@/components/ds/stepper'
import { OPPORTUNITY_PHASE_LABELS, OPPORTUNITY_PHASES } from '@/lib/config/constants'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const PHASE_STEPS: StepperStep[] = [
  { label: OPPORTUNITY_PHASE_LABELS[1] },
  { label: OPPORTUNITY_PHASE_LABELS[2] },
  { label: OPPORTUNITY_PHASE_LABELS[3] },
  { label: OPPORTUNITY_PHASE_LABELS[4] },
]

interface OpportunityPhaseStepperProps {
  currentPhase: number
  onAdvancePhase: (nextPhase: number) => Promise<void>
  isAdvancing?: boolean
  disabled?: boolean
}

export function OpportunityPhaseStepper({
  currentPhase,
  onAdvancePhase,
  isAdvancing = false,
  disabled = false,
}: OpportunityPhaseStepperProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const activeStepIndex = currentPhase - 1
  const nextPhase = currentPhase + 1
  const canAdvance = currentPhase < OPPORTUNITY_PHASES.GEWONNEN && !disabled

  const handleAdvanceClick = () => {
    if (!canAdvance) return
    if (nextPhase === OPPORTUNITY_PHASES.GEWONNEN) {
      setShowConfirm(true)
    } else {
      onAdvancePhase(nextPhase)
    }
  }

  const handleConfirmWin = async () => {
    await onAdvancePhase(OPPORTUNITY_PHASES.GEWONNEN)
    setShowConfirm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Stepper steps={PHASE_STEPS} activeStep={activeStepIndex} />
      {canAdvance && (
        <div className="flex justify-end">
          <Button
            onClick={handleAdvanceClick}
            disabled={isAdvancing}
            size="sm"
          >
            {isAdvancing
              ? 'Wird aktualisiert...'
              : `Weiter zu "${OPPORTUNITY_PHASE_LABELS[nextPhase]}"`}
          </Button>
        </div>
      )}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opportunity als gewonnen markieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Die Opportunity wird als erfolgreich abgeschlossen markiert. Diese
              Aktion setzt den Status auf &quot;Gewonnen&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWin} disabled={isAdvancing}>
              {isAdvancing ? 'Wird gespeichert...' : 'Als gewonnen markieren'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
