'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { LEAD_STATUS, LEAD_STATUS_LABELS } from '@/lib/config/constants'

interface LeadStatusSelectorProps {
  currentStatus: number
  onStatusChange: (newStatus: number) => Promise<void>
  disabled?: boolean
}

export function LeadStatusSelector({
  currentStatus,
  onStatusChange,
  disabled = false,
}: LeadStatusSelectorProps) {
  const [showGewonnenDialog, setShowGewonnenDialog] = useState(false)
  const [showVerlorenDialog, setShowVerlorenDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleChange = (value: string) => {
    const newStatus = Number(value)
    if (newStatus === currentStatus) return

    if (newStatus === LEAD_STATUS.GEWONNEN) {
      setPendingStatus(newStatus)
      setShowGewonnenDialog(true)
    } else if (newStatus === LEAD_STATUS.VERLOREN) {
      setPendingStatus(newStatus)
      setShowVerlorenDialog(true)
    } else {
      executeStatusChange(newStatus)
    }
  }

  const executeStatusChange = async (status: number) => {
    setIsUpdating(true)
    try {
      await onStatusChange(status)
    } finally {
      setIsUpdating(false)
      setPendingStatus(null)
    }
  }

  const handleConfirmGewonnen = async () => {
    if (pendingStatus !== null) {
      await executeStatusChange(pendingStatus)
    }
    setShowGewonnenDialog(false)
  }

  const handleConfirmVerloren = async () => {
    if (pendingStatus !== null) {
      await executeStatusChange(pendingStatus)
    }
    setShowVerlorenDialog(false)
  }

  return (
    <>
      <Select
        value={String(currentStatus)}
        onValueChange={handleChange}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LEAD_STATUS_LABELS).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Gewonnen confirmation */}
      <AlertDialog open={showGewonnenDialog} onOpenChange={setShowGewonnenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead als gewonnen markieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Lead wird als &quot;Gewonnen&quot; markiert und eine neue
              Opportunity wird automatisch erstellt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGewonnen} disabled={isUpdating}>
              {isUpdating ? 'Wird gespeichert...' : 'Bestaetigen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verloren confirmation */}
      <AlertDialog open={showVerlorenDialog} onOpenChange={setShowVerlorenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead als verloren markieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Lead wird als &quot;Verloren&quot; markiert. Sie koennen den
              Status spaeter wieder aendern.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVerloren} disabled={isUpdating}>
              {isUpdating ? 'Wird gespeichert...' : 'Als verloren markieren'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
