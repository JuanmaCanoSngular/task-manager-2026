import { Dialog, Transition } from '@headlessui/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

const DialogTransition = ({ children, show }: { children: React.ReactNode; show: boolean }) => (
  <Transition
    appear
    show={show}
    enter="ease-out duration-300"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="ease-in duration-200"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
  >
    {children}
  </Transition>
);

const BackdropTransition = ({ children, show }: { children: React.ReactNode; show: boolean }) => (
  <Transition
    show={show}
    enter="ease-out duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="ease-in duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    {children}
  </Transition>
);

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) => {
  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <BackdropTransition show={isOpen}>
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </BackdropTransition>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogTransition show={isOpen}>
              <div
                role="dialog"
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-6 shadow-xl transition-all"
              >
                <h3
                  role="heading"
                  className="text-lg font-medium leading-6 text-light dark:text-dark"
                >
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    {cancelText}
                  </button>
                  <button type="button" onClick={onConfirm} className="btn-remove">
                    {confirmText}
                  </button>
                </div>
              </div>
            </DialogTransition>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
