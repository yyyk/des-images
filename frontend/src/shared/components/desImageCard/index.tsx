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
        <button className="btn btn-primary" onClick={handleOnClick} data-testid="ConfirmModal__cta">
          Confirm Mint
        </button>
      }
    >
      <h5 className="mt-0 mb-0">Disclaimer:</h5>
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
          If more than ten mints occur in one block or if someone else is also minting the same token at around the same
          time, your mint transaction might fail. In such a case,{' '}
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
  showStatus?: boolean;
  isLoading?: boolean;
  onRemove?: () => void;
  onMint?: (tokenData: TokenData) => void | Promise<void>;
  onBurn?: (tokenData: TokenData) => void | Promise<void>;
}

const DesImageCard = ({
  tokenData,
  showPlaintext = false,
  showCiphertext = false,
  showStatus = false,
  isLoading = false,
  onRemove,
  onMint,
  onBurn,
}: DesImageCardProps) => {
  const { theme } = useThemeContext();
  const { walletAddress } = useWalletContext();
  const { isPaused } = useContractContext();
  const [open, setOpen] = useState(false);
  const date = `#${tokenData.year}${String(tokenData.month).padStart(2, '0')}${String(tokenData.day).padStart(2, '0')}`;
  const { status, isOwner } = tokenData;
  const showMintButton = onMint && status === TOKEN_STATUS.FOR_SALE;
  const showBurnButton = onBurn && isOwner && status === TOKEN_STATUS.MINTED;

  const handleOnSubmit = async () => {
    if (walletAddress && tokenData && onMint) {
      onMint(tokenData);
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
    if (walletAddress && tokenData && tokenData.tokenId && onBurn) {
      onBurn(tokenData);
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
        <figure className="!m-0 !p-0 !block" data-testid="desImagesCard__image">
          <DesImageSvg date={date} ciphertext={tokenData.ciphertext} />
        </figure>
        <div className={`relative card-body !gap-0 ${onMint && status === TOKEN_STATUS.FOR_SALE ? '!pb-5' : ''}`}>
          {onRemove && (
            <button
              className="absolute btn btn-square btn-sm !w-[28px] !h-[28px] !min-h-[28px] right-3 sm:right-4 top-3 sm:top-4"
              onClick={handleRemove}
              data-testid="desImagesCard__cta-remove"
              aria-label="remove"
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
          {showStatus && !isNil(status) && (
            <div className="badge badge-md badge-outline mb-1" data-testid="desImagesCard__status-badge">
              {status === TOKEN_STATUS.MINTED ? 'Minted' : status === TOKEN_STATUS.BURNED ? 'Burned' : 'Available'}
            </div>
          )}
          <h2 className="card-title !mt-0 !mb-1 !gap-0" data-testid="desImagesCard__title">
            {date}
          </h2>
          {showCiphertext && tokenData?.ciphertext && (
            <code
              className={`w-full overflow-hidden text-ellipsis font-normal opacity-60 p-0 m-0 mt-0 ${
                showPlaintext ? 'mb-1 sm:mb-0.5' : 'mb-2'
              }`}
              data-testid="desImagesCard__ciphertext"
            >
              {tokenData.ciphertext}
            </code>
          )}
          {showPlaintext && tokenData?.plaintext && (
            <p
              className={`w-full overflow-hidden text-ellipsis m-0 ${
                showMintButton || showBurnButton ? 'mb-3' : 'mb-2'
              }`}
              data-testid="desImagesCard__plaintext"
            >
              {tokenData.plaintext}
            </p>
          )}
          {showMintButton && (
            <div className="card-actions justify-end">
              <div
                className={!walletAddress || isPaused ? 'tooltip tooltip-left' : ''}
                data-tip={!walletAddress ? 'Please connect wallet' : isPaused ? 'Currently minting paused' : ''}
              >
                <button
                  className={`btn px-8 ${isLoading ? 'loading' : ''}`}
                  onClick={handleOnMint}
                  disabled={!walletAddress || isLoading || isPaused}
                  data-testid="desImagesCard__cta-mint"
                >
                  Mint
                </button>
              </div>
            </div>
          )}
          {showBurnButton && (
            <div className="card-actions justify-end">
              <div
                className={!walletAddress ? 'tooltip tooltip-left' : ''}
                data-tip={!walletAddress ? 'Please connect wallet' : ''}
              >
                <button
                  className={`btn px-8 ${isLoading ? 'loading' : ''}`}
                  onClick={handleOnBurn}
                  disabled={!walletAddress || isLoading}
                  data-testid="desImagesCard__cta-burn"
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
