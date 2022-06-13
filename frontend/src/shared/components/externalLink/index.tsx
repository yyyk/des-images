import { ReactNode } from 'react';

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="link" href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

export default ExternalLink;
