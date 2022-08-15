import { useCatalogContext } from 'src/shared/contexts/catalog';
import { useContractContext } from 'src/shared/contexts/contract';
import { useNotificationContext } from 'src/shared/contexts/notification';
import { NOTIFICATION_TYPE, TokenData } from 'src/shared/interfaces';
import { getTokenId } from 'src/shared/utils/tokenDataHelpers';
import DesImageCard from 'src/shared/components/desImageCard';

const Collection = () => {
  const { ownedTokenData, burned, processStarted, processEnded } = useCatalogContext();
  const { isUserTokenIDsLoading, ownedTokenIds, burn } = useContractContext();
  const { add: addNotification } = useNotificationContext();

  const handleBurn = async (data: TokenData) => {
    processStarted(data);
    const res = await burn(data?.tokenId || getTokenId(data.dateHex, data.ciphertext));
    if (!res) {
      addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Burn failed.' });
      processEnded(data);
      return;
    }
    addNotification({ type: NOTIFICATION_TYPE.SUCCESS, text: 'Burned.' });
    burned(data);
  };

  if ((ownedTokenData.length === 0 && ownedTokenIds.length) || isUserTokenIDsLoading) {
    return <p className="pt-3 sm:mt-4">Loading... (it may take some time)</p>;
  }

  return ownedTokenData?.length ? (
    <ul
      className={`w-2/3 sm:w-full list-none grid gap-8 grid-cols-1 sm:grid-cols-2 grid-rows-${
        ownedTokenData.length
      } sm:grid-rows-${Math.ceil(ownedTokenData.length / 2)} mt-0 mx-auto px-0 pb-0 pt-3 sm:pt-4`}
    >
      {ownedTokenData.map((data) => (
        <li
          key={`collection-${data.plaintext?.replace(/\s/g, '-') ?? ''}-${data.dateHex}-${data.ciphertext}`}
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
  );
};

export default Collection;
