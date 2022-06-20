import { useCatalogContext } from 'src/shared/contexts/catalog';
import { useContractContext } from 'src/shared/contexts/contract';
import { useNotificationContext } from 'src/shared/contexts/notification';
import { NOTIFICATION_TYPE, TokenData } from 'src/shared/interfaces';
import DesImageCard from 'src/shared/components/desImageCard';
import { isNil } from 'src/shared/utils/isNil';

const Collection = () => {
  const { ownedTokenData, isUserTokensLoading, burned, processStarted, processEnded } = useCatalogContext();
  const { isUserTokenIDsLoading, burn } = useContractContext();
  const { add: addNotification } = useNotificationContext();

  const handleBurn = async (data: TokenData) => {
    processStarted(data);
    const res = data?.tokenId ? await burn(data.tokenId) : false;
    if (!res) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Burn failed.' });
      processEnded(data);
      return;
    }
    addNotification({ type: NOTIFICATION_TYPE.SUCCESS, text: 'Burned.' });
    burned(data);
  };

  if ((isUserTokensLoading && ownedTokenData?.length === 0) || isUserTokenIDsLoading) {
    return <p className="pt-3 sm:mt-4">Loading...</p>;
  }

  return (
    <>
      {ownedTokenData?.length ? (
        <ul
          className={`w-2/3 sm:w-full list-none grid gap-8 grid-cols-1 sm:grid-cols-2 grid-rows-${
            ownedTokenData.length
          } sm:grid-rows-${Math.ceil(ownedTokenData.length / 2)} mt-0 mx-auto px-0 pb-0 pt-3 sm:pt-4`}
        >
          {ownedTokenData.map((data) => (
            <li
              key={`collection-${data.plaintext?.replace(/\s/g, '-') ?? ''}-${data.dateHex}-${data.ciphertext}-${
                isNil(data.status) ? '' : data.status
              }-${data.isInProcess ? 'loading' : 'loaded'}`}
              className="w-full m-0 p-0"
            >
              <DesImageCard
                tokenData={data}
                showPlaintext={true}
                showCiphertext={true}
                isLoading={data.isInProcess ?? false}
                onBurn={handleBurn}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="pt-3 sm:mt-4">Currently you don't own any tokens.</p>
      )}
    </>
  );
};

export default Collection;
