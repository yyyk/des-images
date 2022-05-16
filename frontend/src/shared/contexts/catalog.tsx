import { BigNumber, ethers } from 'ethers';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import { useContractContext } from 'src/shared/contexts/contract';
import { convertTokenURIToTokenData, getTokenId, isSameTokenData } from 'src/shared/utils/tokenDataHelpers';
import { getTokenIds, getTokenStatus, isOwnerOf, tokenURI } from 'src/shared/services/contract';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { LOCAL_STORAGE_TOKEN_DATA_KEY } from 'src/shared/constants';

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
  const { contract } = useContractContext();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [ownedTokenData, setOwnedTokenData] = useState<TokenData[]>([]);

  useEffectOnce(() => {
    const storedData = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_DATA_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          setTokenData(parsedData);
        }
      } catch (err) {}
    }
  });

  const _updateTokenData = (data: TokenData[]) => {
    setTokenData(data);
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_DATA_KEY, JSON.stringify(data));
  };

  const _getTokenStatus = async (data: TokenData) =>
    (contract && (await getTokenStatus(contract, data.dateHex, data.ciphertext))) ?? undefined;

  const _getIsOwner = async (data: TokenData) =>
    data.status === TOKEN_STATUS.MINTED
      ? (contract && (await isOwnerOf(contract, data.dateHex, data.ciphertext))) ?? false
      : false;

  const _updateTokenDataStatus = async () => {
    const result = [];
    for (const data of tokenData) {
      if (data) {
        let _data: TokenData = { ...data };
        const status = await _getTokenStatus(data);
        _data = { ..._data, status };
        const isOwner = await _getIsOwner(data);
        const tokenId = isOwner ? getTokenId(data) : '';
        _data = { ..._data, isOwner, tokenId };
        result.push(_data);
      }
    }
    _updateTokenData(result);
  };

  const _fetchOwnedTokenData = async () => {
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
            const data = convertTokenURIToTokenData(uri, id);
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
  };

  useEffect(() => {
    tokenData && tokenData.length > 0 && _updateTokenDataStatus();
    _fetchOwnedTokenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const add = async (data: TokenData) => {
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, data));
    if (index < 0) {
      const index = ownedTokenData.findIndex((_data) => isSameTokenData(_data, data));
      if (index > -1) {
        _updateTokenData([{ ...ownedTokenData[index] }, ...tokenData]);
        return true;
      }
      const status = await _getTokenStatus(data);
      const isOwner = await _getIsOwner(data);
      const tokenId = isOwner ? getTokenId(data) : '';
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
      tokenId:
        data.tokenId ||
        ethers.utils.solidityKeccak256(
          ['uint32', 'uint128'],
          [parseInt(data.dateHex), BigNumber.from(data.ciphertext)],
        ),
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
      tokenId:
        data.tokenId ||
        ethers.utils.solidityKeccak256(
          ['uint32', 'uint128'],
          [parseInt(data.dateHex), BigNumber.from(data.ciphertext)],
        ),
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
