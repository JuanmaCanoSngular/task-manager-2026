import { ColorPicker } from '../../common/ColorPicker';
import { BOARD_COLORS } from '../../../interfaces/board.interface';

interface BoardColorProps {
  value: string;
  onChange: (color: string) => void;
}

export const BoardColor = ({ value, onChange }: BoardColorProps) => (
  <ColorPicker
    label="Color del tablero"
    value={value}
    onChange={onChange}
    presets={BOARD_COLORS}
  />
);
