import '@testing-library/jest-dom';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ColorPicker } from '../../../src/components/common/ColorPicker';
import { APP_COLOR_PRESETS } from '../../../src/constants/color-presets';

afterEach(() => {
  cleanup();
});

describe('ColorPicker', () => {
  test('renders presets and custom picker button', () => {
    render(
      <ColorPicker
        value={APP_COLOR_PRESETS[0]}
        onChange={vi.fn()}
        presets={APP_COLOR_PRESETS}
        ariaLabel="Elegir color"
      />
    );

    expect(screen.getByRole('button', { name: /elegir color personalizado/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(APP_COLOR_PRESETS.length + 1);
  });

  test('calls onChange when preset is clicked', () => {
    const onChange = vi.fn();
    render(
      <ColorPicker
        value={APP_COLOR_PRESETS[0]}
        onChange={onChange}
        presets={APP_COLOR_PRESETS}
        ariaLabel="Elegir color"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: `Color ${APP_COLOR_PRESETS[1]}` }));
    expect(onChange).toHaveBeenCalledWith(APP_COLOR_PRESETS[1]);
  });

  test('shows custom color when value is not a preset', () => {
    render(
      <ColorPicker
        value="#aabbcc"
        onChange={vi.fn()}
        presets={APP_COLOR_PRESETS}
        ariaLabel="Elegir color"
      />
    );

    const customButton = screen.getByRole('button', { name: /elegir color personalizado/i });
    expect(customButton).toHaveAttribute('aria-pressed', 'true');
    expect(customButton).toHaveStyle({ backgroundColor: '#aabbcc' });
  });
});
