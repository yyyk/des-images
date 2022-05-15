import { MouseEvent, useEffect } from 'react';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import DesImageSvg from 'src/shared/components/desImageSvg';
import { useContractContext } from 'src/shared/contexts/contract';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { useThemeContext } from 'src/shared/contexts/theme';

interface DesImageCardProps {
  tokenData: TokenData;
  showPlaintext?: boolean;
  showCiphertext?: boolean;
  onMint?: (result: boolean) => void;
  onBurn?: (result: boolean) => void;
}

const DesImageCard = ({
  tokenData,
  showPlaintext = false,
  showCiphertext = false,
  onMint,
  onBurn,
}: DesImageCardProps) => {
  const { theme } = useThemeContext();
  const { walletAddress } = useWalletContext();
  const { isLoading, isPaused, mint, burn, mintPrice, burnPrice, updateMintPrice, updateBurnPrice, updateIsPaused } =
    useContractContext();
  const date = `#${tokenData.year}${String(tokenData.month).padStart(2, '0')}${String(tokenData.day).padStart(2, '0')}`;
  const status = tokenData.status;

  useEffect(() => {
    updateIsPaused();
    updateMintPrice();
    updateBurnPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnMint = async (e: MouseEvent) => {
    e.preventDefault();
    if (walletAddress && tokenData) {
      const res = await mint(tokenData.dateHex, tokenData.ciphertext);
      onMint && onMint(res);
    }
  };

  const handleOnBurn = async (e: MouseEvent) => {
    e.preventDefault();
    if (walletAddress && tokenData && tokenData.tokenId) {
      const res = await burn(tokenData.tokenId);
      onBurn && onBurn(res);
    }
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
      <div className={`card-body !gap-0 ${onMint && status === TOKEN_STATUS.FOR_SALE ? '!pb-5' : ''}`}>
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
              <button className="btn px-8" onClick={handleOnMint} disabled={!walletAddress || isLoading || isPaused}>
                Mint
              </button>
            </div>
          </div>
        )}
        {onBurn && tokenData.isOwner && status === TOKEN_STATUS.MINTED && (
          <div className="card-actions justify-end">
            <div
              className={'tooltip tooltip-left'}
              data-tip={`${!walletAddress ? 'Please connect wallet' : `Reward: ${burnPrice} ETH`}`}
            >
              <button className="btn px-8" onClick={handleOnBurn} disabled={!walletAddress || isLoading}>
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
