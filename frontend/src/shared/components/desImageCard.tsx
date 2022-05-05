import React, { useEffect, useState } from 'react';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import DesImageSvg from 'src/shared/components/desImageSvg';
import { useContractContext } from 'src/shared/contexts/contract';
import { useWalletContext } from '../contexts/wallet';
import { useThemeContext } from '../contexts/theme';

interface DesImageCardProps {
  tokenData: TokenData;
  onMint?: (e: React.MouseEvent) => void;
}

// TODO:
// if the user mints this, update isAvailable
// if the user is owner of this, show 'Burn' cta
const DesImageCard = ({ tokenData, onMint }: DesImageCardProps) => {
  const { theme } = useThemeContext();
  const { walletAddress } = useWalletContext();
  const { getTokenStatus, isLoading, mint } = useContractContext();
  const [status, setStatus] = useState(0);
  const date = `#${tokenData.year}${String(tokenData.month).padStart(2, '0')}${String(tokenData.day).padStart(2, '0')}`;

  useEffect(() => {
    async function checkAvailability() {
      const _status = await getTokenStatus(tokenData.dateHex, tokenData.ciphertext);
      if (_status !== undefined || _status !== null) {
        setStatus(_status as TOKEN_STATUS);
      }
    }
    checkAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData]);

  const handleOnMint = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (walletAddress && tokenData) {
      // setIsLoading(true);
      await mint(tokenData.dateHex, tokenData.ciphertext);
      // setIsLoading(false);
      onMint && onMint(e);
    }
  };

  return (
    <div
      className={`card card-compact${
        theme === 'lofi' ? ' bg-base-100 shadow-xl' : theme === 'black' ? ' bg-neutral text-neutral-content' : ''
      }`}
    >
      <div>
        <DesImageSvg date={date} ciphertext={tokenData.ciphertext} />
      </div>
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="card-title mt-0">{date}</h2>
            {!onMint && (status === TOKEN_STATUS.MINTED || status === TOKEN_STATUS.BURNED) && (
              <div className="badge badge-outline">{status === TOKEN_STATUS.MINTED ? 'Minted' : 'Burned'}</div>
            )}
          </div>
          {!onMint && status === TOKEN_STATUS.FOR_SALE && (
            <div className="card-actions justify-end">
              <div className={!walletAddress ? 'tooltip tooltip-left' : ''} data-tip="please connect wallet">
                <button className="btn" onClick={handleOnMint} disabled={!walletAddress || isLoading}>
                  Mint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesImageCard;
