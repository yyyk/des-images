import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useContractContext } from 'src/shared/contexts/contract';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import { tokenURI } from 'src/shared/services/contract';
import {
  convertTokenURIToTokenData,
  getIsOwner,
  getTokenDataFromLocalStorage,
  getTokenId,
  getTokenStatus,
  isSameTokenData,
  updateTokenDataStatus,
  writeTokenDataToLocalStorage,
} from 'src/shared/utils/tokenDataHelpers';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { Contract } from 'ethers';

interface ContextState {
  tokenData: TokenData[];
  ownedTokenData: TokenData[];
  add: (data: TokenData) => Promise<boolean>;
  remove: (data: TokenData) => void;
  minted: (data: TokenData) => void;
  burned: (data: TokenData) => void;
}

const CatalogContext = createContext({} as ContextState);

const CatalogContextProvider = ({ children }: { children: ReactNode }) => {
  const { contract, ownedTokenIds } = useContractContext();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [ownedTokenData, setOwnedTokenData] = useState<TokenData[]>([]);

  const _updateTokenData = (data: TokenData[]) => {
    setTokenData(data);
    writeTokenDataToLocalStorage(data);
  };

  const _updateTokenDataStatus = async (contract: Contract | null, data: TokenData[]) => {
    _updateTokenData(await updateTokenDataStatus(contract, data));
  };

  // TODO:
  const _fetchOwnedTokenData = async (contract: Contract | null, ownedTokenIds: string[]) => {
    if (!contract || !ownedTokenIds || ownedTokenIds.length === 0) {
      setOwnedTokenData([]);
      return;
    }
    // const ids = await getTokenIds(contract);
    const ids = ownedTokenIds?.reverse();
    if (!ids || !Array.isArray(ids)) {
      setOwnedTokenData([]);
      return;
    }
    const res = [];
    for (const id of ids) {
      if (id) {
        try {
          const uri = await tokenURI(contract, id);
          const data = convertTokenURIToTokenData(uri, id);
          res.unshift(data);
        } catch (err) {
          console.error(err);
        }
      }
    }
    setOwnedTokenData(res);
  };

  useEffectOnce(() => {
    setTokenData(getTokenDataFromLocalStorage());
  });

  useEffect(() => {
    tokenData && tokenData.length > 0 && _updateTokenDataStatus(contract, tokenData);
    _fetchOwnedTokenData(contract, ownedTokenIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, ownedTokenIds]);

  const add = async (data: TokenData) => {
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, data));
    if (index < 0) {
      const index = ownedTokenData.findIndex((_data) => isSameTokenData(_data, data));
      if (index > -1) {
        _updateTokenData([{ ...ownedTokenData[index] }, ...tokenData]);
        return true;
      }
      const status = await getTokenStatus(contract, data);
      const isOwner = await getIsOwner(contract, data);
      const tokenId = isOwner ? getTokenId(data.dateHex, data.ciphertext) : '';
      _updateTokenData([{ ...data, isOwner, status, tokenId }, ...tokenData]);
      return true;
    }
    return false;
  };

  const remove = (data: TokenData) => {
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, data));
    if (index > -1) {
      _updateTokenData([...tokenData.slice(0, index), ...tokenData.slice(index + 1)]);
    }
  };

  const minted = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: true,
      status: TOKEN_STATUS.MINTED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
    };
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index > -1) {
      _updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    setOwnedTokenData([{ ...newData }, ...ownedTokenData]);
  };

  const burned = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: false,
      status: TOKEN_STATUS.BURNED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
    };
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index > -1) {
      _updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    setOwnedTokenData(ownedTokenData.filter((_data) => !isSameTokenData(_data, newData)));
  };

  return (
    <CatalogContext.Provider value={{ tokenData, ownedTokenData, add, remove, minted, burned }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => useContext(CatalogContext);

export default CatalogContextProvider;
