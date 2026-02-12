'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ds/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEAD_SOURCE_OPTIONS } from '@/lib/config/constants'
import type { LeadCreateDto } from '@/types/dataverse'

interface LeadFormProps {
  initialData?: Partial<LeadCreateDto>
  onSubmit: (data: LeadCreateDto) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function LeadForm({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Create Lead',
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadCreateDto>({
    firstname: initialData.firstname || '',
    lastname: initialData.lastname || '',
    companyname: initialData.companyname || '',
    emailaddress1: initialData.emailaddress1 || '',
    mobilephone: initialData.mobilephone || '',
    jobtitle: initialData.jobtitle || '',
    leadsourcecode: initialData.leadsourcecode,
    description: initialData.description || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.companyname?.trim()) {
      newErrors.companyname = 'Company name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const updateField = (field: keyof LeadCreateDto, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First Name" htmlFor="firstname">
          <Input
            id="firstname"
            value={formData.firstname || ''}
            onChange={(e) => updateField('firstname', e.target.value)}
            placeholder="John"
          />
        </FormField>

        <FormField label="Last Name" htmlFor="lastname">
          <Input
            id="lastname"
            value={formData.lastname || ''}
            onChange={(e) => updateField('lastname', e.target.value)}
            placeholder="Smith"
          />
        </FormField>
      </div>

      <FormField label="Company" htmlFor="companyname" required error={errors.companyname}>
        <Input
          id="companyname"
          value={formData.companyname || ''}
          onChange={(e) => updateField('companyname', e.target.value)}
          placeholder="Acme Corp"
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={formData.emailaddress1 || ''}
            onChange={(e) => updateField('emailaddress1', e.target.value)}
            placeholder="john@acme.com"
          />
        </FormField>

        <FormField label="Mobile Phone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={formData.mobilephone || ''}
            onChange={(e) => updateField('mobilephone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </FormField>
      </div>

      <FormField label="Job Title" htmlFor="jobtitle">
        <Input
          id="jobtitle"
          value={formData.jobtitle || ''}
          onChange={(e) => updateField('jobtitle', e.target.value)}
          placeholder="VP of Sales"
        />
      </FormField>

      <FormField label="Lead Source" htmlFor="leadsource">
        <Select
          value={formData.leadsourcecode?.toString() || ''}
          onValueChange={(val) => updateField('leadsourcecode', parseInt(val))}
        >
          <SelectTrigger id="leadsource">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Notes" htmlFor="description">
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Any additional details..."
          rows={3}
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
