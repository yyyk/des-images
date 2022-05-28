import DesImageCard from 'src/shared/components/desImageCard';
import { useCatalogContext } from 'src/shared/contexts/catalog';

const Collection = () => {
  const { tokenData, ownedTokenData, minted, burned } = useCatalogContext();

  return (
    <>
      {ownedTokenData.length > 0 ? (
        <ul
          className={`w-2/3 sm:w-full list-none grid gap-8 grid-cols-1 sm:grid-cols-2 grid-rows-${
            tokenData.length
          } sm:grid-rows-${Math.ceil(tokenData.length / 2)} mt-0 mx-auto px-0 pb-0 pt-3 sm:pt-4`}
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
