import { render, screen } from '@testing-library/react';
import App from './App';

test('renders calculator display and buttons', () => {
  render(<App />);
  expect(screen.getByRole('status')).toBeInTheDocument(); // display
  // A few representative buttons
  expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /equals/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
});
