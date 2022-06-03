import { ReactNode } from 'react';

const Code = ({ wordBreak = false, children }: { wordBreak?: boolean; children: ReactNode }) => (
  <code style={{ wordBreak: wordBreak ? 'break-all' : undefined }} className="bg-neutral">
    {children}
  </code>
);

export default Code;
