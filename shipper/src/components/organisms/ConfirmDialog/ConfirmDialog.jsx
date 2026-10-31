import Button from '@/components/atoms/Button'
import Modal from '@/components/organisms/Modal'

/**
 * Yes/no confirmation. Focus starts on Cancel so Enter never confirms by accident. While `loading`
 * (the caller's pending mutation) the dialog cannot be dismissed.
 *
 *   <ConfirmDialog open={open} onClose={close} onConfirm={remove} tone="danger"
 *     title="Remove item?" message="This item will be removed from your cart." confirmLabel="Remove" />
 */
export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'primary',
    loading = false,
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="sm"
            title={title}
            closeOnBackdrop={!loading}
            closeOnEscape={!loading}
            footer={
                <>
                    <Button variant="secondary" data-autofocus disabled={loading} onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <div>{message}</div>
        </Modal>
    )
}