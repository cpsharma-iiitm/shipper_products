export default function Icon({ name, size = 18, color = 'currentColor', style = {} }) {
  return <span aria-label={name} style={{ display: 'inline-flex', width: size, height: size, color, ...style }}>{name}</span>;
}
