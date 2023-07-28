import { render, screen } from '@testing-library/react';
import Login from './index';

describe('Home', () => {
  it('renders a login heading', () => {
    render(<Login />);

    const heading = screen.getByRole('heading', {
      name: 'Welcome to apperture',
    });

    expect(heading).toBeInTheDocument();
  });


});
