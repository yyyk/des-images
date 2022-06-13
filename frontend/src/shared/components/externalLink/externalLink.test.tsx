import { render, screen } from '@testing-library/react';
import ExternalLink from '.';

describe('<ExternalLink>', function () {
  const url = 'https://example.com';
  const text = 'test text';

  it('has href attribute', function () {
    render(<ExternalLink href={url}>{text}</ExternalLink>);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders passed children', function () {
    render(<ExternalLink href={url}>{text}</ExternalLink>);
    expect(screen.getByText(text)).toBeInTheDocument();

    const text2 = 'another test text';
    render(
      <ExternalLink href={url}>
        <span>{text2}</span>
      </ExternalLink>,
    );
    expect(screen.getByText(text2)).toBeInTheDocument();
  });
});
