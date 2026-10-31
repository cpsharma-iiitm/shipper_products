import clsx from 'clsx'
/** Bootstrap Icons glyph. Decorative unless `label` is given: <Icon name="search" /> */
export default function Icon({ name, size, label, className, style, ...rest }) {
  return (
    <i
      className={clsx('bi', `bi-${name}`, className)}
      style={size ? { fontSize: size, ...style } : style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...rest}
    />
  )
}