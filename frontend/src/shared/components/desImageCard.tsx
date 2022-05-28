import { MouseEvent, useState } from 'react';
import { useContractContext } from 'src/shared/contexts/contract';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { useThemeContext } from 'src/shared/contexts/theme';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import DesImageSvg from 'src/shared/components/desImageSvg';

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
  const { isPaused, mintPrice, burnPrice, mint, burn } = useContractContext();
  const [isLoading, setIsLoading] = useState(false);
  const date = `#${tokenData.year}${String(tokenData.month).padStart(2, '0')}${String(tokenData.day).padStart(2, '0')}`;
  const { status, isOwner } = tokenData;

  const handleOnMint = async (e: MouseEvent) => {
    e.preventDefault();
    if (walletAddress && tokenData) {
      setIsLoading(true);
      const res = await mint(tokenData.dateHex, tokenData.ciphertext);
      onMint && onMint(res);
      setIsLoading(false);
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
    <div
      className={`h-full card card-compact${
        theme === 'lofi' ? ' bg-base-100 shadow-xl' : theme === 'black' ? ' bg-neutral text-neutral-content' : ''
      }`}
    >
      <div>
        <DesImageSvg date={date} ciphertext={tokenData.ciphertext} />
      </div>
      <div className={`relative card-body !gap-0 ${onMint && status === TOKEN_STATUS.FOR_SALE ? '!pb-5' : ''}`}>
        {onRemove && (
          <button className="btn btn-square btn-sm absolute right-4 top-4" onClick={handleRemove}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {onMint && status !== undefined && status !== null && (
          <div className="badge badge-md badge-outline mb-1">
            {status === TOKEN_STATUS.MINTED ? 'Minted' : status === TOKEN_STATUS.BURNED ? 'Burned' : 'Available'}
          </div>
        )}
        <h2 className="card-title !my-0">{date}</h2>
        {showPlaintext && <p className="w-full overflow-hidden text-ellipsis m-0 mb-2">{tokenData.plaintext}</p>}
        {/* {showCiphertext && <p className="w-full overflow-hidden text-ellipsis m-0 mb-2">{tokenData.ciphertext}</p>} */}
        {onMint && status === TOKEN_STATUS.FOR_SALE && (
          <div className="card-actions justify-end">
            <div
              className={'tooltip tooltip-left'}
              data-tip={`${
                !walletAddress
                  ? 'Please connect wallet'
                  : isPaused
                  ? 'Currently minting paused'
                  : `Cost: ${mintPrice} ETH`
              }`}
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
              className="tooltip tooltip-left"
              data-tip={`${!walletAddress ? 'Please connect wallet' : `Reward: ${burnPrice} ETH`}`}
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
  );
};

export default DesImageCard;
