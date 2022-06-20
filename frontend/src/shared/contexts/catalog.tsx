import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useContractContext } from 'src/shared/contexts/contract';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import {
  getOwnerOf,
  getTokenDataFromLocalStorage,
  getTokenDataFromTokenIds,
  getTokenId,
  getTokenStatus,
  isSameTokenData,
  updateTokenDataStatus,
  writeTokenDataToLocalStorage,
} from 'src/shared/utils/tokenDataHelpers';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { Contract } from 'ethers';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { isSameAddress } from 'src/shared/utils/contractHelpers';

interface ContextState {
  tokenData: TokenData[];
  ownedTokenData: TokenData[];
  isUserTokensLoading: boolean;
  add: (data: TokenData) => Promise<boolean>;
  remove: (data: TokenData) => void;
  minted: (data: TokenData) => void;
  burned: (data: TokenData) => void;
  processStarted: (data: TokenData) => void;
  processEnded: (data: TokenData) => void;
}

const CatalogContext = createContext({} as ContextState);

const CatalogContextProvider = ({ children }: { children: ReactNode }) => {
  const { walletAddress, walletProvider, logout } = useWalletContext();
  const { contract, ownedTokenIds } = useContractContext();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [ownedTokenData, setOwnedTokenData] = useState<TokenData[]>([]);
  const [isUserTokensLoading, setIsUserTokensLoading] = useState(false);
  const tokenDataRef = useRef<TokenData[]>([]);
  const ownedTokenDataRef = useRef<TokenData[]>([]);

  const _updateTokenData = (data: TokenData[]) => {
    tokenDataRef.current = [...data];
    setTokenData([...tokenDataRef.current]);
    writeTokenDataToLocalStorage(data);
  };

  const _updateOwnedTokenData = (data: TokenData[]) => {
    ownedTokenDataRef.current = [...data];
    setOwnedTokenData([...ownedTokenDataRef.current]);
  };

  const _updateTokenDataStatus = async (contract: Contract | null, data: TokenData[], walletAddress: string) => {
    const newData = await updateTokenDataStatus(contract, data, walletAddress);
    const res: TokenData[] = [];
    tokenDataRef.current.forEach((_data) => {
      const index = newData.findIndex((d) => isSameTokenData(d, _data));
      index >= 0 && res.push({ ...newData[index] });
    });
    _updateTokenData(res);
  };

  const _fetchOwnedTokenData = async (contract: Contract | null, ownedTokenIds: string[]) => {
    if (!contract || !ownedTokenIds || ownedTokenIds.length === 0) {
      _updateOwnedTokenData([]);
      return;
    }
    setIsUserTokensLoading(true);
    const _ownedTokenData = (await getTokenDataFromTokenIds(contract, ownedTokenIds)).map((data) => {
      const index = ownedTokenDataRef.current.findIndex((_data) => isSameTokenData(_data, data));
      return { ...data, isInProcess: index >= 0 && ownedTokenDataRef.current[index].isInProcess };
    });
    _updateOwnedTokenData(_ownedTokenData);
    setIsUserTokensLoading(false);
  };

  useEffectOnce(() => {
    tokenDataRef.current = getTokenDataFromLocalStorage();
    setTokenData([...tokenDataRef.current]);
  });

  useEffect(() => {
    tokenDataRef.current &&
      tokenDataRef.current?.length &&
      _updateTokenDataStatus(contract, [...tokenDataRef.current], walletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    _fetchOwnedTokenData(contract, ownedTokenIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, ownedTokenIds]);

  useEffect(() => {
    if (!walletProvider) {
      return;
    }
    async function beforeunloadListener() {
      if (
        walletProvider &&
        (tokenData.some((data) => data.isInProcess) || ownedTokenData.some((data) => data.isInProcess))
      ) {
        await logout(walletProvider);
      }
    }
    window.addEventListener('beforeunload', beforeunloadListener);
    return () => {
      window.removeEventListener('beforeunload', beforeunloadListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletProvider, tokenData, ownedTokenData]);

  const add = async (data: TokenData) => {
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, data));
    if (index >= 0) {
      return false;
    }
    const status = !contract ? undefined : await getTokenStatus(contract, data);
    const ownerAddress = await getOwnerOf(contract, data);
    const isOwner = ownerAddress.length === 0 ? false : isSameAddress(ownerAddress, walletAddress);
    const tokenId = isOwner ? getTokenId(data.dateHex, data.ciphertext) : '';
    _updateTokenData([{ ...data, isOwner, status, tokenId }, ...tokenDataRef.current]);
    return true;
  };

  const remove = (data: TokenData) => {
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, data));
    if (index >= 0) {
      _updateTokenData([...tokenDataRef.current.slice(0, index), ...tokenDataRef.current.slice(index + 1)]);
    }
  };

  const _process = (data: TokenData, isInProcess: boolean) => {
    const newData: TokenData = {
      ...data,
      isInProcess,
    };
    let index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([
        ...tokenDataRef.current.slice(0, index),
        { ...newData },
        ...tokenDataRef.current.slice(index + 1),
      ]);
    }
    index = ownedTokenDataRef.current.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateOwnedTokenData([
        ...ownedTokenDataRef.current.slice(0, index),
        { ...newData },
        ...ownedTokenDataRef.current.slice(index + 1),
      ]);
    }
  };

  const processStarted = (data: TokenData) => {
    _process(data, true);
  };

  const processEnded = (data: TokenData) => {
    _process(data, false);
  };

  const minted = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: true,
      status: TOKEN_STATUS.MINTED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
      isInProcess: false,
    };
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([
        ...tokenDataRef.current.slice(0, index),
        { ...newData },
        ...tokenDataRef.current.slice(index + 1),
      ]);
    }
    _updateOwnedTokenData([
      { ...newData },
      ...ownedTokenDataRef.current.filter((_data) => !isSameTokenData(_data, newData)),
    ]);
  };

  const burned = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: false,
      status: TOKEN_STATUS.BURNED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
      isInProcess: false,
    };
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([
        ...tokenDataRef.current.slice(0, index),
        { ...newData },
        ...tokenDataRef.current.slice(index + 1),
      ]);
    }
    _updateOwnedTokenData(ownedTokenDataRef.current.filter((_data) => !isSameTokenData(_data, newData)));
  };

  return (
    <CatalogContext.Provider
      value={{
        tokenData,
        ownedTokenData,
        isUserTokensLoading,
        add,
        remove,
        minted,
        burned,
        processStarted,
        processEnded,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => useContext(CatalogContext);

export default CatalogContextProvider;
