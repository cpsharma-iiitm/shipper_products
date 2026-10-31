import Overlay from '@/components/organisms/Overlay'
/**
* Panel sliding in from the right (440px; Edit address). placement="bottom" renders a bottom
* sheet instead, used for the mobile filter panel.
*/
export default function Drawer({ placement = 'right', ...props }) {
  return <Overlay placement={placement} {...props} />
}