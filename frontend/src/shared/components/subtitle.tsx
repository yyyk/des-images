import { useState } from 'react';
import Modal from './modal';

const Subtitle = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <h2 className="m-0">
        On-chain NFT with{' '}
        <button className="btn-link btn-active font-bold text-inherit" onClick={() => setOpen(true)}>
          a linear bonding curve offering
        </button>
      </h2>
      <Modal open={open} onClose={() => setOpen(false)}>
        <>
          <h5 className="mt-0 mb-3">The total supply amount governs the mint price.</h5>
          <ul>
            <li>The very first token costs 0.01 ETH. Every mint raises the price by 0.001 ETH.</li>
            <li>99.5% of the mint price is stored in the contract, while 0.5% goes to the creator.</li>
            <li className="mb-0">
              The burn rewards the owner of the token the amount equals to 99.5% of last mint price.
            </li>
          </ul>
        </>
      </Modal>
    </>
  );
};

export default Subtitle;
