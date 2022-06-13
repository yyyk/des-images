import { MouseEvent, useState } from 'react';
import { useContractContext } from 'src/shared/contexts/contract';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { useThemeContext } from 'src/shared/contexts/theme';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import { isNil } from 'src/shared/utils/isNil';
import DesImageSvg from 'src/shared/components/desImageSvg';
import Modal from 'src/shared/components/modal';

const ConfirmModal = ({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: () => void }) => {
  const handleOnClick = () => {
    onClose();
    onSubmit();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      actions={
        <button className="btn btn-primary" onClick={handleOnClick}>
          Confirm Mint
        </button>
      }
    >
      <p className="mt-0 mb-0">Notes:</p>
      <ul>
        <li>
          The smart contract is <strong>unaudited</strong>, though it's written with extra care.{' '}
          <strong>Please mint at your own risk.</strong>
        </li>
        <li>
          Since <strong>only one token per price point</strong> can be minted, the buffer of <strong>0.01 ETH</strong>{' '}
          is added to the cost to ensure that the transaction succeeds.
        </li>
        <li>
          If there is more than one mint transaction per block, a part of the buffer is used to pay the mint cost at the
          time of confirmation.
        </li>
        <li>
          <strong>The unused part of the buffer will be refunded.</strong>
        </li>
        <li className="mb-0">
          If more than 10 mints occur in one block, your mint transaction might fail. In such case,{' '}
          <strong>you would still be charged for the transaction fee</strong>, though the Ether sent to the contract
          would be returned.
        </li>
      </ul>
    </Modal>
  );
};

interface DesImageCardProps {
  tokenData: TokenData;
  showPlaintext?: boolean;
  showCiphertext?: boolean;
  onRemove?: () => void;
  onMint?: (result: boolean) => void;
  onBurn?: (result: boolean) => void;
}

const DesImageCard = ({
  tokenData,
  showPlaintext = false,
  showCiphertext = false,
  onRemove,
  onMint,
  onBurn,
}: DesImageCardProps) => {
  const { theme } = useThemeContext();
  const { walletAddress } = useWalletContext();
  const { isPaused, mint, burn } = useContractContext();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const date = `#${tokenData.year}${String(tokenData.month).padStart(2, '0')}${String(tokenData.day).padStart(2, '0')}`;
  const { status, isOwner } = tokenData;

  const handleOnSubmit = async () => {
    if (walletAddress && tokenData) {
      setIsLoading(true);
      const res = await mint(tokenData.dateHex, tokenData.ciphertext);
      onMint && onMint(res);
      setIsLoading(false);
    }
  };

  const handleOnMint = async (e: MouseEvent) => {
    e.preventDefault();
    if (walletAddress && tokenData) {
      setOpen(true);
    }
  };

  const handleOnBurn = async (e: MouseEvent) => {
    e.preventDefault();
    if (walletAddress && tokenData && tokenData.tokenId) {
      setIsLoading(true);
      const res = await burn(tokenData.tokenId);
      onBurn && onBurn(res);
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove && onRemove();
  };

  return (
    <>
      <div
        className={`h-full card card-compact ${
          theme === 'lofi' ? 'bg-base-100 shadow-xl' : theme === 'black' ? 'bg-neutral text-neutral-content' : ''
        }`}
      >
        <figure className="!m-0 !p-0 !block">
          <DesImageSvg date={date} ciphertext={tokenData.ciphertext} />
        </figure>
        <div className={`relative card-body !gap-0 ${onMint && status === TOKEN_STATUS.FOR_SALE ? '!pb-5' : ''}`}>
          {onRemove && (
            <button
              className="absolute btn btn-square btn-sm !w-[28px] !h-[28px] !min-h-[28px] right-3 sm:right-4 top-3 sm:top-4"
              onClick={handleRemove}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {onMint && isNil(status) && (
            <div className="badge badge-md badge-outline mb-1">
              {status === TOKEN_STATUS.MINTED ? 'Minted' : status === TOKEN_STATUS.BURNED ? 'Burned' : 'Available'}
            </div>
          )}
          <h2 className="card-title !mt-0 !mb-1 sm:!mb-0 !gap-0">{date}</h2>
          {showCiphertext && (
            <code
              className={`w-full overflow-hidden text-ellipsis font-normal opacity-60 p-0 m-0 mt-0 ${
                showPlaintext ? 'mb-1 sm:mb-0.5' : 'mb-2'
              }`}
            >
              {tokenData.ciphertext}
            </code>
          )}
          {showPlaintext && <p className="w-full overflow-hidden text-ellipsis m-0 mb-2">{tokenData.plaintext}</p>}
          {onMint && status === TOKEN_STATUS.FOR_SALE && (
            <div className="card-actions justify-end">
              <div
                className={!walletAddress || isPaused ? 'tooltip tooltip-left' : ''}
                data-tip={!walletAddress ? 'Please connect wallet' : isPaused ? 'Currently minting paused' : ''}
              >
                <button
                  className={`btn px-8 ${isLoading ? 'loading' : ''}`}
                  onClick={handleOnMint}
                  disabled={!walletAddress || isLoading || isPaused}
                >
                  Mint
                </button>
              </div>
            </div>
          )}
          {onBurn && isOwner && status === TOKEN_STATUS.MINTED && (
            <div className="card-actions justify-end">
              <div
                className={!walletAddress ? 'tooltip tooltip-left' : ''}
                data-tip={!walletAddress ? 'Please connect wallet' : ''}
              >
                <button
                  className={`btn px-8 ${isLoading ? 'loading' : ''}`}
                  onClick={handleOnBurn}
                  disabled={!walletAddress || isLoading}
                >
                  Burn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal open={open} onClose={() => setOpen(false)} onSubmit={handleOnSubmit} />
    </>
  );
};

export default DesImageCard;
