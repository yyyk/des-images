import DesImageCard from 'src/shared/components/desImageCard';
import { useCatalogContext } from 'src/shared/contexts/catalog';
import { useContractContext } from 'src/shared/contexts/contract';

const Collection = () => {
  const { ownedTokenData, minted, burned } = useCatalogContext();
  const { isUserTokensLoading } = useContractContext();

  if (isUserTokensLoading) {
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
              key={`collection-${data.plaintext?.replace(/\s/g, '-') ?? ''}-${data.dateHex}-${data.ciphertext}`}
              className="w-full m-0 p-0"
            >
              <DesImageCard
                tokenData={data}
                showPlaintext={true}
                onMint={(res) => res && minted(data)}
                onBurn={(res) => res && burned(data)}
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
