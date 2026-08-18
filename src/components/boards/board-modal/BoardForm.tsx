import { useState } from 'react';
import { BoardName } from './BoardName';
import { BoardColor } from './BoardColor';
import { BoardActions } from './BoardActions';
import { BoardKindPicker } from './BoardKindPicker';
import { BOARD_COLORS, BoardKind } from '../../../interfaces/board.interface';

interface BoardFormProps {
  onSubmit: (name: string, color: string, kind?: BoardKind) => void;
  onCancel: () => void;
  initialName?: string;
  initialColor?: string;
  submitLabel?: string;
  showKindPicker?: boolean;
}

export const BoardForm = ({
  onSubmit,
  onCancel,
  initialName = '',
  initialColor = BOARD_COLORS[0],
  submitLabel,
  showKindPicker = false,
}: BoardFormProps) => {
  const [boardName, setBoardName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [kind, setKind] = useState<BoardKind>('kanban');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    setIsSubmitting(true);
    try {
      onSubmit(boardName.trim(), color, showKindPicker ? kind : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BoardName value={boardName} onChange={setBoardName} />
      {showKindPicker ? <BoardKindPicker value={kind} onChange={setKind} /> : null}
      <BoardColor value={color} onChange={setColor} />
      <BoardActions
        isSubmitting={isSubmitting}
        isValid={!!boardName.trim()}
        onCancel={onCancel}
        submitLabel={submitLabel}
      />
    </form>
  );
};
