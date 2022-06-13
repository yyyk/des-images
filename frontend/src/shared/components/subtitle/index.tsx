import { useState } from 'react';
import Modal from 'src/shared/components/modal';
import { BASE_MINT_PRICE, MINT_PRICE_COEF } from 'src/shared/constants';

const BCOModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Modal open={open} onClose={onClose} data-testid="subtitle__modal">
    <h5 className="mt-0 mb-3" data-testid="subtitle__modal__heading">
      The total supply amount governs the mint price.
    </h5>
    <ul data-testid="subtitle__modal__list">
      <li className="mt-0">
        The very first token costs <strong>{BASE_MINT_PRICE} ETH</strong>. Each increase in supply raises the token's
        price by <strong>{MINT_PRICE_COEF} ETH</strong>. Likewise, each decrease in supply lowers the token's price by{' '}
        <strong>{MINT_PRICE_COEF} ETH</strong>.
      </li>
      <li>
        <strong>99.5%</strong> of the mint price is stored in the contract, while <strong>0.5%</strong> goes to the
        creator.
      </li>
      <li className="mb-0">
        Burning a token rewards the owner of the token the amount equals to <strong>99.5% of last mint price</strong>.
      </li>
    </ul>
  </Modal>
);

const Subtitle = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <h2 className="m-0" data-testid="subtitle__heading">
        On-chain NFT with{' '}
        <button
          className="btn-link btn-active font-bold text-inherit"
          onClick={() => setOpen(true)}
          data-testid="subtitle__cta"
        >
          a linear bonding curve offering
        </button>
      </h2>
      <BCOModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default Subtitle;
