import '@testing-library/jest-dom';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Landing } from '../../../src/components/auth/Landing';

afterEach(() => {
  cleanup();
});

describe('Landing', () => {
  test('envía nickname y contraseña', async () => {
    const onSignInNickname = vi.fn(() => Promise.resolve());
    render(
      <Landing onSignInGoogle={vi.fn()} onSignInNickname={onSignInNickname} />
    );

    fireEvent.change(screen.getByLabelText(/^usuario$/i), { target: { value: 'elisabeth' } });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'secreta' } });
    fireEvent.submit(screen.getByRole('form', { name: /entrar con usuario/i }));

    await waitFor(() => {
      expect(onSignInNickname).toHaveBeenCalledWith('elisabeth', 'secreta');
    });
  });

  test('muestra error si falla el login', async () => {
    const onSignInNickname = vi.fn(() => Promise.reject(new Error('Usuario o contraseña incorrectos')));
    render(
      <Landing onSignInGoogle={vi.fn()} onSignInNickname={onSignInNickname} />
    );

    fireEvent.change(screen.getByLabelText(/^usuario$/i), { target: { value: 'elisabeth' } });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'mala' } });
    fireEvent.submit(screen.getByRole('form', { name: /entrar con usuario/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrectos/i);
  });
});
