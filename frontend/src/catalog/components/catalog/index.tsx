import { useRef } from 'react';
import { useContractContext } from 'src/shared/contexts/contract';
import { useNotificationContext } from 'src/shared/contexts/notification';
import { NOTIFICATION_TYPE, PreviewFormData, TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import { getTokenData, getTokenId } from 'src/shared/utils/tokenDataHelpers';
import DesImageCard from 'src/shared/components/desImageCard';
import ModPreviewForm from 'src/shared/components/modPreviewForm';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { DEFAULT_PLAINTEXT } from 'src/shared/constants';

const Catalog = () => {
  const { isInvalidChainId } = useWalletContext();
  const { contract, mint, burn, tokenData, addTokenData, removeTokenData, updateTokenData } = useContractContext();
  const { add: addNotification } = useNotificationContext();
  const scrollRef = useRef<HTMLLIElement>(null);

  const handleOnPreview = async ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => {
    const _tokenData = getTokenData({ year, month, day, plaintext, ciphertext });
    const result = await addTokenData(_tokenData);
    if (!result) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Preview already exists.' });
      return;
    }
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  const handleMint = async (data: TokenData) => {
    updateTokenData({ ...data, isInProcess: true });
    const res = await mint(data.dateHex, data.ciphertext);
    if (!res) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Mint failed.' });
      updateTokenData({ ...data, isInProcess: false });
      return;
    }
    addNotification({ type: NOTIFICATION_TYPE.SUCCESS, text: 'Minted.' });
    updateTokenData({
      ...data,
      isOwner: true,
      status: TOKEN_STATUS.MINTED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
      isInProcess: false,
    });
  };

  const handleBurn = async (data: TokenData) => {
    updateTokenData({ ...data, isInProcess: true });
    const res = await burn(data?.tokenId || getTokenId(data.dateHex, data.ciphertext));
    if (!res) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Burn failed.' });
      updateTokenData({ ...data, isInProcess: false });
      return;
    }
    addNotification({ type: NOTIFICATION_TYPE.SUCCESS, text: 'Burned.' });
    updateTokenData({
      ...data,
      isOwner: false,
      status: TOKEN_STATUS.BURNED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
      isInProcess: false,
    });
  };

  return (
    <>
      <div className="pt-0 sm:pt-3 pb-10 px-3 sm:px-0">
        <ModPreviewForm
          onSubmit={handleOnPreview}
          defaultPlaintext={DEFAULT_PLAINTEXT}
          showHint={true}
          showTokenIdInput={!isInvalidChainId && contract ? true : false}
        />
      </div>
      <ul
        className={`w-2/3 sm:w-full list-none grid gap-12 sm:gap-8 grid-cols-1 sm:grid-cols-2 grid-rows-${
          tokenData.length
        } sm:grid-rows-${Math.ceil(tokenData.length / 2)} mt-0 mx-auto p-0`}
      >
        {tokenData.map((data, index) => (
          <li
            ref={index === 0 ? scrollRef : undefined}
            key={`catalog-${data.plaintext?.replace(/\s/g, '-') ?? ''}-${data.dateHex}-${data.ciphertext}`}
            className="w-full m-0 p-0"
          >
            <DesImageCard
              tokenData={data}
              showPlaintext={true}
              showCiphertext={true}
              showStatus={true}
              isLoading={data.isInProcess ?? false}
              onMint={handleMint}
              onBurn={handleBurn}
              onRemove={() => removeTokenData(data)}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export default Catalog;
