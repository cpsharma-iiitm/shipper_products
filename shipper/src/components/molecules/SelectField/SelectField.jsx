import ReactSelect, { components } from 'react-select'
import Icon from '@/components/atoms/Icon'

const HEIGHTS = {
  sm: 'var(--sh-control-h-sm)',
  md: 'var(--sh-control-h-md)',
  lg: 'var(--sh-control-h-lg)',
}

function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <Icon name="chevron-down" size="0.75rem" />
    </components.DropdownIndicator>
  )
}

// Toolbar filters read "Category: All", so an optional prefix is rendered inside the value.
function SingleValue({ children, ...props }) {
  const prefix = props.selectProps.prefixLabel
  return (
    <components.SingleValue {...props}>
      {prefix ? `${prefix} ${children}` : children}
    </components.SingleValue>
  )
}

// Average glyph width of Inter semibold in em, and the space the control spends on padding and the chevron.
// Good enough to size a toolbar pill to its text without measuring the DOM.
const FIT_CHAR_WIDTH_EM = 0.6
const FIT_CHROME = '2.5rem'

function fitWidthFor(prefixLabel, selected) {
  const characters = (prefixLabel ? prefixLabel.length + 1 : 0) + (selected?.label?.length ?? 0)
  return `calc(${(characters * FIT_CHAR_WIDTH_EM).toFixed(2)}em + ${FIT_CHROME})`
}

function buildStyles({ size, invalid, variant, fitWidth }) {
  const borderColor = (state) => {
    if (invalid) return 'var(--sh-color-danger)'
    return state.isFocused ? 'var(--sh-color-primary)' : variant === 'filled' ? 'transparent' : 'var(--sh-color-border)'
  }

  const controlFontSize = 'var(--sh-control-font-size, var(--sh-font-size-base))'

  return {
    // `fit` pills are sized in em, so the container needs the control's font size to resolve them.
    container: (base) => (fitWidth ? { ...base, width: fitWidth, minWidth: '6rem', maxWidth: '100%', fontSize: controlFontSize } : base),
    control: (base, state) => ({
      ...base,
      minHeight: HEIGHTS[size],
      borderRadius: 'var(--sh-radius-sm)',
      borderColor: borderColor(state),
      backgroundColor: variant === 'filled' ? 'var(--sh-color-surface)' : 'var(--sh-color-white)',
      boxShadow: state.isFocused ? 'var(--sh-focus-ring)' : 'none',
      fontSize: controlFontSize,
      cursor: 'pointer',
      '&:hover': { borderColor: invalid ? 'var(--sh-color-danger)' : 'var(--sh-color-primary)' },
    }),
    valueContainer: (base) => ({ ...base, padding: fitWidth ? '0 0 0 0.625rem' : '0 0.75rem' }),
    placeholder: (base) => ({ ...base, color: 'var(--sh-color-muted)' }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--sh-color-ink)',
      fontWeight: fitWidth ? 'var(--sh-font-weight-semibold)' : 'var(--sh-font-weight-medium)',
    }),
    input: (base) => ({ ...base, color: 'var(--sh-color-ink)' }),
    dropdownIndicator: (base) => ({ ...base, padding: fitWidth ? '0 0.5rem 0 0.25rem' : '0 0.75rem', color: 'var(--sh-color-muted)' }),
    clearIndicator: (base) => ({ ...base, padding: '0 0.25rem' }),
    menu: (base) => ({
      ...base,
      overflow: 'hidden',
      border: '1px solid var(--sh-color-border)',
      borderRadius: 'var(--sh-radius-md)',
      boxShadow: 'var(--sh-shadow-md)',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 'var(--sh-z-popover)' }),
    option: (base, state) => ({
      ...base,
      fontSize: 'var(--sh-control-font-size, var(--sh-font-size-base))',
      cursor: 'pointer',
      color: state.isSelected ? 'var(--sh-color-white)' : 'var(--sh-color-ink)',
      backgroundColor: state.isSelected
        ? 'var(--sh-color-primary)'
        : state.isFocused
          ? 'var(--sh-color-primary-tint)'
          : 'transparent',
      '&:active': { backgroundColor: 'var(--sh-color-primary-tint)' },
    }),
    multiValue: (base) => ({ ...base, borderRadius: 'var(--sh-radius-xs)', backgroundColor: 'var(--sh-color-primary-tint)' }),
    multiValueLabel: (base) => ({ ...base, color: 'var(--sh-color-primary)', fontWeight: 'var(--sh-font-weight-medium)' }),
  }
}

/**
 * react-select styled with the Shipper tokens. `value` and `onChange` use plain option values
 * (not option objects), so it works directly with React Hook Form's Controller.
 *
 *   <SelectField options={[{ value: 'haldi', label: 'Haldi' }]} value={category} onChange={setCategory} />
 *   <SelectField prefixLabel="Category:" … />   // toolbar filter reading "Category: All"
 *
 * `fit` sizes a single select to its current text (the compact filter pills in the admin design) instead of
 * filling its container, so the wrapper must not stretch it.
 */
export default function SelectField({
  ref,
  options,
  value,
  onChange,
  isMulti = false,
  isSearchable = false,
  size = 'lg',
  variant = 'outline',
  invalid = false,
  prefixLabel,
  fit = false,
  id,
  ...rest
}) {
  const selected = isMulti
    ? options.filter((option) => (value ?? []).includes(option.value))
    : (options.find((option) => option.value === value) ?? null)

  const handleChange = (next) => {
    if (isMulti) onChange?.((next ?? []).map((option) => option.value))
    else onChange?.(next ? next.value : null)
  }

  return (
    <ReactSelect
      ref={ref}
      inputId={id}
      options={options}
      value={selected}
      onChange={handleChange}
      isMulti={isMulti}
      isSearchable={isSearchable}
      prefixLabel={prefixLabel}
      components={{ DropdownIndicator, SingleValue, IndicatorSeparator: null }}
      styles={buildStyles({ size, invalid, variant, fitWidth: fit && !isMulti ? fitWidthFor(prefixLabel, selected) : undefined })}
      menuPortalTarget={typeof document === 'undefined' ? undefined : document.body}
      menuPosition="fixed"
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}