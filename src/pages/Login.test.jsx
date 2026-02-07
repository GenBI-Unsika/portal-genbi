import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../components/Toast.jsx', () => {
  return {
    useToast: () => ({ push: vi.fn() }),
  };
});

vi.mock('../contexts/ConfirmContext.jsx', () => {
  return {
    useConfirm: () => ({ confirm: vi.fn().mockResolvedValue(true) }),
  };
});

vi.mock('../components/GoogleLoginButton.jsx', () => {
  return {
    default: () => null,
  };
});

import Login from './Login.jsx';

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('auto-fills password for student.unsika.ac.id numeric email when empty', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const email = screen.getByPlaceholderText('contoh@student.unsika.ac.id');
    const password = screen.getByPlaceholderText('••••••••••••');

    await user.type(email, '20201234@student.unsika.ac.id');
    expect(password).toHaveValue('20201234');
  });

  it('does not overwrite password once user typed it', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const email = screen.getByPlaceholderText('contoh@student.unsika.ac.id');
    const password = screen.getByPlaceholderText('••••••••••••');

    await user.type(password, 'manualpass');
    await user.type(email, '20201234@student.unsika.ac.id');

    expect(password).toHaveValue('manualpass');
  });
});
