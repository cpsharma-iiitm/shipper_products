import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import Modal from '@/components/organisms/Modal'
import { requiredText } from '@/lib/validation'
import styles from './ScanProductModal.module.scss'

const FORM_ID = 'scan-product-form'
const scanSchema = z.object({ code: requiredText('Scan or enter a product code') })

function ScanForm({ lines, pickedCodes, onPickedChange }) {
  const [lastPicked, setLastPicked] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(scanSchema), defaultValues: { code: '' } })

  // A hand scanner types the code and presses Enter, so the field is submitted like any form.
  const submit = handleSubmit(({ code }) => {
    setLastPicked(null)
    const line = lines.find((candidate) => candidate.productCode.toLowerCase() === code.toLowerCase())
    if (!line) return setError('code', { message: `${code.toUpperCase()} is not on this pick list.` })
    if (line.available < line.quantity) return setError('code', { message: `${line.productCode} is short in stock. Report a discrepancy instead.` })
    if (pickedCodes.has(line.productCode)) return setError('code', { message: `${line.productCode} is already picked.` })
    onPickedChange(new Set([...pickedCodes, line.productCode]))
    setLastPicked(line.productCode)
    return reset({ code: '' })
  })

  return (
    <form id={FORM_ID} noValidate onSubmit={submit} className={styles.form}>
      <FormField label="Product code" hint="For example HL001. Point the scanner at the label or type the code." error={errors.code?.message}>
        {(field) => <Input {...field} autoFocus autoComplete="off" spellCheck={false} placeholder="HL001" {...register('code')} />}
      </FormField>
      {lastPicked && (
        <p className={styles.success} role="status">
          <Icon name="check2" /> {lastPicked} marked as picked.
        </p>
      )}
    </form>
  )
}

/** Marks a pick-list line as picked from a scanned or typed product code. */
export default function ScanProductModal({ open, onClose, lines, pickedCodes, onPickedChange }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Scan product"
      description="Each scan ticks the matching line on the pick list."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
          <Button type="submit" form={FORM_ID}>
            Mark as picked
          </Button>
        </>
      }
    >
      <ScanForm lines={lines} pickedCodes={pickedCodes} onPickedChange={onPickedChange} />
    </Modal>
  )
}
