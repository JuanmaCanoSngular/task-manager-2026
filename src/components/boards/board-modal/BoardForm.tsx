import { useState, useEffect, useCallback } from 'react';
import { BoardName } from '../board-modal/BoardName';
import { BoardLogo } from '../board-modal/BoardLogo';
import { BoardActions } from '../board-modal/BoardActions';

interface BoardFormProps {
  onSubmit: (name: string, emoji: string, color: string) => void;
  onCancel: () => void;
}

export const BoardForm = ({ onSubmit, onCancel }: BoardFormProps) => {
  const [boardName, setBoardName] = useState('');
  const [logoOptions, setLogoOptions] = useState<Array<{ emoji: string; color: string }>>([]);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBoardName('');
    setLogoOptions(generateLogoOptions());
    setSelectedLogoIndex(0);
    setIsSubmitting(false);
  }, []);

  const handleGenerateNewLogos = useCallback(() => {
    setLogoOptions(generateLogoOptions());
    setSelectedLogoIndex(0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boardName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedLogo = logoOptions[selectedLogoIndex];
      onSubmit(boardName.trim(), selectedLogo.emoji, selectedLogo.color);
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BoardName value={boardName} onChange={setBoardName} />

      <BoardLogo
        logoOptions={logoOptions}
        selectedIndex={selectedLogoIndex}
        onSelect={setSelectedLogoIndex}
        onGenerateNew={handleGenerateNewLogos}
      />

      <BoardActions isSubmitting={isSubmitting} isValid={!!boardName.trim()} onCancel={onCancel} />
    </form>
  );
};

const generateEmoji = () => {
  const emojiRanges = [
    [0x1f300, 0x1f5ff], // Misc Symbols and Pictographs
    [0x1f600, 0x1f64f], // Emoticons
    [0x1f680, 0x1f6ff], // Transport and Map Symbols
    [0x1f900, 0x1f9ff], // Supplemental Symbols and Pictographs
    [0x2600, 0x26ff], // Misc Symbols
    [0x2700, 0x27bf], // Dingbats
  ];
  const range = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];
  const codePoint = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  return String.fromCodePoint(codePoint);
};

const generateRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215);
  return '#' + randomColor.toString(16).padStart(6, '0');
};

const generateLogoOptions = (): Array<{ emoji: string; color: string }> => {
  return Array.from({ length: 10 }, () => ({
    emoji: generateEmoji(),
    color: generateRandomColor(),
  }));
};
