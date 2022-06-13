import { fireEvent, render, screen } from '@testing-library/react';
import Subtitle from '.';

describe('<Subtitle>', function () {
  it('has a heading', function () {
    render(<Subtitle />);
    expect(screen.getByTestId('subtitle__heading')).toBeInTheDocument();
  });

  it('has a button to open a modal', function () {
    render(<Subtitle />);
    expect(screen.getByTestId('subtitle__cta')).toBeInTheDocument();
  });

  it('opens a modal when button is clicked', async function () {
    const portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'modal');
    document.body.appendChild(portalRoot);
    render(<Subtitle />);
    const button = screen.getByTestId('subtitle__cta');
    fireEvent.click(button);
    expect(await screen.findByTestId('subtitle__modal__heading')).toBeInTheDocument();
    expect(await screen.findByTestId('subtitle__modal__list')).toBeInTheDocument();
  });
});
