import { useRef } from 'react';
import { useCatalogContext } from 'src/shared/contexts/catalog';
import { NOTIFICATION_TYPE, PreviewFormData, TokenData } from 'src/shared/interfaces';
import { getTokenData } from 'src/shared/utils/tokenDataHelpers';
import DesImageCard from 'src/shared/components/desImageCard';
import ModPreviewForm from 'src/shared/components/modPreviewForm';
import { useNotificationContext } from 'src/shared/contexts/notification';

const Catalog = () => {
  const { tokenData, add, remove, minted, burned } = useCatalogContext();
  const scrollRef = useRef<HTMLLIElement>(null);
  const { add: addNotification } = useNotificationContext();

  const handleOnPreview = async ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => {
    const tokenData = getTokenData({ year, month, day, plaintext, ciphertext });
    const result = await add(tokenData);
    if (!result) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Preview already exists.' });
      return;
    }
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  const handleMinted = (data: TokenData) => (res: boolean) => {
    if (!res) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Mint failed.' });
      return;
    }
    addNotification({ type: NOTIFICATION_TYPE.SUCCESS, text: 'Minted.' });
    minted(data);
  };

  const handleBurned = (data: TokenData) => (res: boolean) => {
    if (!res) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Burn failed.' });
      return;
    }
    addNotification({ type: NOTIFICATION_TYPE.SUCCESS, text: 'Burned.' });
    burned(data);
  };

  return (
    <>
      <div className="pt-0 sm:pt-3 pb-10 px-3 sm:px-0">
        <ModPreviewForm onSubmit={handleOnPreview} defaultPlaintext="i am still alive" showHint={true} />
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
              onMint={handleMinted(data)}
              onBurn={handleBurned(data)}
              onRemove={() => remove(data)}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export default Catalog;