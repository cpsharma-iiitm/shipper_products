import Overlay from '@/components/organisms/Overlay'
/**
* Centered dialog. size: sm (confirmations) | md | lg (900px, Add/Edit Product).
* `footer` holds the action buttons; the body scrolls when the content is tall.
*
*   <Modal open={open} onClose={close} title="Edit product" footer={<Button>Save</Button>}>…</Modal>
*/
export default function Modal({ size = 'lg', ...props }) {
  return <Overlay placement="center" size={size} {...props} />
}