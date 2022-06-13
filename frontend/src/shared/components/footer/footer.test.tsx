/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import { render, screen } from '@testing-library/react';
import Footer from '.';

describe('<Footer>', function () {
  it('has footer tag', function () {
    const view = render(<Footer />);
    expect(view.container.getElementsByTagName('footer')).toHaveLength(1);
  });

  it('has a list of links', function () {
    render(<Footer />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
