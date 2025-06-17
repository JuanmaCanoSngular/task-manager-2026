import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { BoardForm } from './BoardForm';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, emoji: string, color: string) => void;
}

export const BoardModal = ({ isOpen, onClose, onSubmit }: BoardModalProps) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="modal-backdrop-transition-enter"
        enterFrom="modal-backdrop-transition-enter-from"
        enterTo="modal-backdrop-transition-enter-to"
        leave="modal-backdrop-transition-leave"
        leaveFrom="modal-backdrop-transition-leave-from"
        leaveTo="modal-backdrop-transition-leave-to"
      >
        <div className="modal-backdrop" />
      </Transition.Child>

      <div className="modal-container">
        <div className="modal-wrapper">
          <Transition.Child
            as={Fragment}
            enter="modal-transition-enter"
            enterFrom="modal-transition-enter-from"
            enterTo="modal-transition-enter-to"
            leave="modal-transition-leave"
            leaveFrom="modal-transition-leave-from"
            leaveTo="modal-transition-leave-to"
          >
            <Dialog.Panel className="modal-panel">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title as="h3" className="modal-title">
                  Create new board
                </Dialog.Title>
                <button onClick={onClose} className="modal-close-button">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <BoardForm onSubmit={onSubmit} onCancel={onClose} />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
