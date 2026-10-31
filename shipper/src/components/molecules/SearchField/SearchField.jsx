import IconButton from '@/components/atoms/IconButton'
import Input from '@/components/atoms/Input'

/**
 * Controlled search box with a leading icon and a clear button. Submit with Enter via `onSubmit`.
 * Pass `aria-label` (or render a visible label) so the field has an accessible name.
 */
export default function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search',
  size = 'lg',
  variant = 'outline',
  className,
  ...rest
}) {
  return (
    <form
      role="search"
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(value)
      }}
    >
      <Input
        type="search"
        size={size}
        variant={variant}
        leftIcon="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rightSlot={
          value ? <IconButton icon="x-lg" label="Clear search" size="sm" onClick={() => onChange('')} /> : null
        }
        {...rest}
      />
    </form>
  )
}