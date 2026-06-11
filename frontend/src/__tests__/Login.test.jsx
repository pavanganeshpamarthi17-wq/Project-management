import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/Login';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn()
}));

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false
  })
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Login Page Tests', () => {
  it('renders login form components correctly', () => {
    render(<Login />);
    
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('displays validation errors when fields are empty', () => {
    render(<Login />);
    
    const signInBtn = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(signInBtn);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('populates fields when using demo account button', () => {
    render(<Login />);
    
    const demoBtn = screen.getByRole('button', { name: 'Use demo account' });
    fireEvent.click(demoBtn);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput.value).toBe('demo@projectflow.app');
    expect(passwordInput.value).toBe('demo123456');
  });
});
