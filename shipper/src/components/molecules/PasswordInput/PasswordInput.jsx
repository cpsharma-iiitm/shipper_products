import { useState } from 'react'
import IconButton from '@/components/atoms/IconButton'
import Input from '@/components/atoms/Input'
/** Password field with a show/hide toggle. Accepts every Input prop (including `ref` and `invalid`). */
export default function PasswordInput({ autoComplete = 'current-password', ...rest }) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      rightSlot={
        <IconButton
          icon={visible ? 'eye-slash' : 'eye'}
          label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          size="sm"
          onClick={() => setVisible((current) => !current)}
        />
      }
      {...rest}
    />
  )
}