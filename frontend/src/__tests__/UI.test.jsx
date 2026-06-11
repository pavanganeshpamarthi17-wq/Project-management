import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, ProgressBar, Badge, Button, Avatar } from '../components/common/UI';

describe('UI Components Unit Tests', () => {
  describe('Card', () => {
    it('renders card content correctly', () => {
      render(
        <Card data-testid="card-element">
          <div>Test Content</div>
        </Card>
      );
      const card = screen.getByTestId('card-element');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Test Content');
    });
  });

  describe('ProgressBar', () => {
    it('sets progress width correctly based on percentage value', () => {
      const { container } = render(<ProgressBar value={45} />);
      const progressFiller = container.firstChild.firstChild;
      expect(progressFiller).toHaveStyle('width: 45%');
    });

    it('caps percentage width at 100%', () => {
      const { container } = render(<ProgressBar value={120} />);
      const progressFiller = container.firstChild.firstChild;
      expect(progressFiller).toHaveStyle('width: 100%');
    });

    it('sets minimum percentage width at 0%', () => {
      const { container } = render(<ProgressBar value={-20} />);
      const progressFiller = container.firstChild.firstChild;
      expect(progressFiller).toHaveStyle('width: 0%');
    });
  });

  describe('Badge', () => {
    it('renders correctly with given text', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('renders children inside button', () => {
      render(<Button>Submit Now</Button>);
      expect(screen.getByRole('button', { name: 'Submit Now' })).toBeInTheDocument();
    });

    it('disables button when loading is active', () => {
      render(<Button loading>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled;
    });
  });

  describe('Avatar', () => {
    it('renders initials from user name', () => {
      render(<Avatar name="Alice Smith" />);
      expect(screen.getByText('AS')).toBeInTheDocument();
    });

    it('renders default initials for empty name', () => {
      render(<Avatar name="" />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });
});
