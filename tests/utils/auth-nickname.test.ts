import { describe, expect, test } from 'vitest';
import {
  displayIdentity,
  isValidNickname,
  nicknameToEmail,
  normalizeNickname,
} from '../../src/utils/auth-nickname';

describe('auth-nickname', () => {
  test('normaliza a minúsculas', () => {
    expect(normalizeNickname('  Eli  ')).toBe('eli');
  });

  test('valida nickname', () => {
    expect(isValidNickname('elisabeth')).toBe(true);
    expect(isValidNickname('eli.beth')).toBe(true);
    expect(isValidNickname('a')).toBe(false);
    expect(isValidNickname('bad nick')).toBe(false);
  });

  test('mapea a email sintético', () => {
    expect(nicknameToEmail('Elisabeth')).toBe('elisabeth@users.taskblero.local');
  });

  test('displayIdentity oculta el dominio sintético', () => {
    expect(displayIdentity('elisabeth@users.taskblero.local')).toBe('elisabeth');
    expect(displayIdentity('persona@gmail.com')).toBe('persona@gmail.com');
  });
});
