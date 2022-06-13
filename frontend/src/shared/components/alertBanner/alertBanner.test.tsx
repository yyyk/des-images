import { render, screen } from '@testing-library/react';
import AlertBanner from '.';

describe('<AlertBanner>', function () {
  it('has alert icon', function () {
    render(<AlertBanner />);
    expect(screen.getByTestId('alert-banner__icon')).toBeInTheDocument();
  });

  it('has alert text', function () {
    render(<AlertBanner />);
    expect(screen.getByTestId('alert-banner__text')).toBeInTheDocument();
  });
});
