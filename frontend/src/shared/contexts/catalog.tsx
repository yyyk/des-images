import { BigNumber, ethers } from 'ethers';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import { useContractContext } from 'src/shared/contexts/contract';
import { getTokenData, isSameTokenData } from 'src/shared/utils/tokenDataHelper';
import { getTokenIds, getTokenStatus, isOwnerOf, tokenURI } from 'src/shared/services/contract';
// import { useEffectOnce } from 'src/shared/utils/hookHelper';

interface ContextState {
  tokenData: TokenData[];
  ownedTokenData: TokenData[];
  add: (data: TokenData) => Promise<boolean>;
  minted: (data: TokenData) => void;
  burned: (data: TokenData) => void;
}

const CatalogContext = createContext({} as ContextState);

const CatalogContextProvider = ({ children }: { children: ReactNode }) => {
  const { contract } = useContractContext();
  const [tokenData, setTokenData] = useState<TokenData[]>(JSON.parse(window.localStorage.getItem('tokenData') ?? '[]'));
  const [ownedTokenData, setOwnedTokenData] = useState<TokenData[]>([]);

  const updateTokenData = (data: TokenData[]) => {
    setTokenData(data);
    window.localStorage.setItem('tokenData', JSON.stringify(data));
  };

  // TODO:
  // useEffectOnce(() => {
  //   console.log(JSON.parse(window.localStorage.getItem('tokenData') ?? '[]'));
  //   setTokenData(JSON.parse(window.localStorage.getItem('tokenData') ?? '[]'));
  // });

  useEffect(() => {
    async function updateTokenDataStatus() {
      const result = [];
      for (const data of tokenData) {
        if (data) {
          let _data: TokenData = { ...data };
          if (data.status === undefined || data.status === null) {
            const status = (contract && (await getTokenStatus(contract, data.dateHex, data.ciphertext))) ?? undefined;
            _data = { ..._data, status };
          }
          if (data.isOwner === undefined || data.isOwner === null) {
            const isOwner =
              data.status === TOKEN_STATUS.MINTED
                ? (contract && (await isOwnerOf(contract, data.dateHex, data.ciphertext))) ?? false
                : false;
            const tokenId = isOwner
              ? ethers.utils.solidityKeccak256(
                  ['uint32', 'uint128'],
                  [parseInt(data.dateHex), BigNumber.from(data.ciphertext)],
                )
              : '';
            _data = { ..._data, isOwner, tokenId };
          }
          result.push(_data);
        }
      }
      updateTokenData(result);
    }
    async function fetchOwnedTokenData() {
      if (!contract) {
        setOwnedTokenData([]);
        return;
      }
      const ids = await getTokenIds(contract);
      if (ids && Array.isArray(ids)) {
        const res = [];
        for (const id of ids) {
          if (id) {
            try {
              const uri = await tokenURI(contract, id);
              const json = JSON.parse(atob(uri?.replace('data:application/json;base64,', '') ?? ''));
              const date = json?.name?.replace('desImages#', '');
              const svg = atob(json?.image?.replace('data:image/svg+xml;base64,', '') ?? '');
              const data: TokenData = {
                ...getTokenData({
                  year: date.slice(0, 4),
                  month: date.slice(4, 6),
                  day: date.slice(6),
                  ciphertext: `0x${svg
                    .match(/fill="#([0-9a-fA-F]{6})"/gi)
                    ?.map((str) => {
                      const res = /fill="#([0-9a-fA-F]{2})[0-9a-fA-F]{4}"/.exec(str);
                      return (res && res[1]) ?? '';
                    })
                    .join('')}`,
                }),
                isOwner: true,
                status: TOKEN_STATUS.MINTED,
                tokenId: id,
              };
              res.unshift(data);
            } catch (err) {
              console.error(err);
            }
          }
        }
        setOwnedTokenData(res);
        return;
      }
      setOwnedTokenData([]);
    }
    updateTokenDataStatus();
    fetchOwnedTokenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const add = async (data: TokenData) => {
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, data));
    if (index < 0) {
      const index = ownedTokenData.findIndex((_data) => isSameTokenData(_data, data));
      if (index > -1) {
        updateTokenData([{ ...ownedTokenData[index] }, ...tokenData]);
        return true;
      }
      const status = (contract && (await getTokenStatus(contract, data.dateHex, data.ciphertext))) ?? undefined;
      const isOwner =
        status === TOKEN_STATUS.MINTED
          ? (contract && (await isOwnerOf(contract.current, data.dateHex, data.ciphertext))) ?? false
          : false;
      const tokenId = isOwner
        ? ethers.utils.solidityKeccak256(
            ['uint32', 'uint128'],
            [parseInt(data.dateHex), BigNumber.from(data.ciphertext)],
          )
        : '';
      updateTokenData([{ ...data, isOwner, status, tokenId }, ...tokenData]);
      return true;
    }
    return false;
  };

  const minted = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: true,
      status: TOKEN_STATUS.MINTED,
      tokenId:
        data.tokenId ||
        ethers.utils.solidityKeccak256(
          ['uint32', 'uint128'],
          [parseInt(data.dateHex), BigNumber.from(data.ciphertext)],
        ),
    };
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index > -1) {
      updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    setOwnedTokenData([{ ...newData }, ...ownedTokenData]);
  };

  const burned = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: false,
      status: TOKEN_STATUS.BURNED,
      tokenId:
        data.tokenId ||
        ethers.utils.solidityKeccak256(
          ['uint32', 'uint128'],
          [parseInt(data.dateHex), BigNumber.from(data.ciphertext)],
        ),
    };
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index > -1) {
      updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    setOwnedTokenData(ownedTokenData.filter((_data) => !isSameTokenData(_data, newData)));
  };

  return (
    <CatalogContext.Provider value={{ tokenData, ownedTokenData, add, minted, burned }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => useContext(CatalogContext);

export default CatalogContextProvider;
