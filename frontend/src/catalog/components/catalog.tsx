import { useRef, useState } from 'react';
import { useCatalogContext } from 'src/shared/contexts/catalog';
import { PreviewFormData } from 'src/shared/interfaces';
import { getTokenData } from 'src/shared/utils/tokenDataHelpers';
import DesImageCard from 'src/shared/components/desImageCard';
import ModPreviewForm from 'src/shared/components/modPreviewForm';
import PreviewAlert from 'src/catalog/components/previewAlert';

const Catalog = () => {
  const { tokenData, add, remove, minted, burned } = useCatalogContext();
  const [showAlert, setShowAlert] = useState(false);
  const timeoutRef = useRef<any>(null);
  const scrollRef = useRef<HTMLLIElement>(null);
  
  const handleOnPreview = async ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => {
    const tokenData = getTokenData({ year, month, day, plaintext, ciphertext });
    const result = await add(tokenData);
    if (!result) {
      setShowAlert(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return;
    }
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  return (
    <>
      <div className="pt-0 sm:pt-4 pb-11 px-3 sm:px-0">
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
              onMint={(res) => res && minted(data)}
              onBurn={(res) => res && burned(data)}
              onRemove={() => remove(data)}
            />
          </li>
        ))}
      </ul>
      <PreviewAlert showAlert={showAlert} />
    </>
  );
};

export default Catalog;
