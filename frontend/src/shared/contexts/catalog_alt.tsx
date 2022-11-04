import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useContractContext } from 'src/shared/contexts/contract_alt';
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
  const { contract, ownedTokenIds, mintedToken, burnedToken } = useContractContext();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const tokenDataRef = useRef<TokenData[]>([]); // TODO: needs refactor
  const [ownedTokenData, setOwnedTokenData] = useState<TokenData[]>([]);
  const [isUserTokensLoading, setIsUserTokensLoading] = useState(false);

  const _updateTokenData = (data: TokenData[]) => {
    tokenDataRef.current = [...data];
    setTokenData([...tokenDataRef.current]);
    writeTokenDataToLocalStorage(data);
  };

  const _resetTokenData = () => {
    tokenDataRef.current = tokenDataRef.current.map((d) => ({
      year: d.year,
      month: d.month,
      day: d.day,
      dateHex: d.dateHex,
      ciphertext: d.ciphertext,
      plaintext: d.plaintext,
    }));
    setTokenData([...tokenDataRef.current]);
  };

  // Read tokenData from local storage.
  useEffectOnce(() => {
    tokenDataRef.current = getTokenDataFromLocalStorage();
    setTokenData([...tokenDataRef.current]);
  });

  // When the contract or wallet address is changed, tokenData statuses are updated.
  // Also, when local storage is updated in another tab, it updates all the tabs.
  useEffect(() => {
    if (!walletAddress || !contract) {
      _resetTokenData();
      return;
    }
    async function _updateTokenDataStatus(contract: Contract | null, data: TokenData[], walletAddress: string) {
      const newData = await updateTokenDataStatus(contract, data, walletAddress);
      const res: TokenData[] = [];
      tokenDataRef.current.forEach((_data) => {
        const index = newData.findIndex((d) => isSameTokenData(d, _data));
        index >= 0 && res.push({ ...newData[index] });
      });
      _updateTokenData(res);
    }

    function storageListener() {
      // TODO: add loading states of each data?
      tokenDataRef.current = getTokenDataFromLocalStorage();
      tokenDataRef.current?.length
        ? _updateTokenDataStatus(contract, [...tokenDataRef.current], walletAddress)
        : setTokenData([]);
    }

    tokenDataRef.current &&
      tokenDataRef.current?.length &&
      _updateTokenDataStatus(contract, [...tokenDataRef.current], walletAddress);

    window.addEventListener('storage', storageListener);
    return () => {
      window.removeEventListener('storage', storageListener);
    };
  }, [contract, walletAddress]);

  // update ownedTokenData by listening the ownedTokenIds's change.
  useEffect(() => {
    async function fetchOwnedTokenData(contract: Contract | null, ownedTokenIds: string[]) {
      if (!contract || !ownedTokenIds || ownedTokenIds.length === 0) {
        setOwnedTokenData([]);
        return;
      }
      setIsUserTokensLoading(true);
      const data = await getTokenDataFromTokenIds(contract, ownedTokenIds);
      setOwnedTokenData((prev) =>
        data.map((d) => {
          const index = prev.findIndex((_d) => isSameTokenData(_d, d));
          return { ...d, isInProcess: index >= 0 && prev[index].isInProcess };
        }),
      );
      setIsUserTokensLoading(false);
    }
    // console.log('ownedTokenIds', ownedTokenIds);
    fetchOwnedTokenData(contract, ownedTokenIds);
  }, [contract, ownedTokenIds]);

  // If the user leaves the page while mint or burn is in progress, logout the wallet
  // to prevent the user seeing mint or burn button not in loading state after reload.
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
  }, [walletProvider, tokenData, ownedTokenData, logout]);

  // When Minted event is emitted from contract, the token is updated in tokenData.
  useEffect(() => {
    if (!mintedToken) {
      return;
    }
    tokenDataRef.current = tokenDataRef.current.map((d: TokenData) => {
      const tokenId = d?.tokenId || getTokenId(d.dateHex, d.ciphertext);
      if (tokenId !== mintedToken.id) {
        return { ...d, tokenId: tokenId };
      }
      return { ...d, tokenId: tokenId, status: 1, isOwner: isSameAddress(walletAddress, mintedToken.to) };
    });
    setTokenData([...tokenDataRef.current]);
  }, [mintedToken, walletAddress]);

  // When Burned event is emitted from contract, the token is updated in tokenData.
  useEffect(() => {
    if (!burnedToken) {
      return;
    }
    tokenDataRef.current = tokenDataRef.current.map((d: TokenData) => {
      const tokenId = d?.tokenId || getTokenId(d.dateHex, d.ciphertext);
      if (tokenId !== burnedToken.id) {
        return { ...d, tokenId: tokenId };
      }
      return { ...d, tokenId: tokenId, status: 2, isOwner: false };
    });
    setTokenData([...tokenDataRef.current]);
  }, [burnedToken, walletAddress]);

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
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([
        ...tokenDataRef.current.slice(0, index),
        { ...newData },
        ...tokenDataRef.current.slice(index + 1),
      ]);
    }
    setOwnedTokenData((prev) => {
      const index = prev.findIndex((_data) => isSameTokenData(_data, newData));
      return index >= 0 ? [...prev.slice(0, index), { ...newData }, ...prev.slice(index + 1)] : [...prev];
    });
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
    setOwnedTokenData((prev) => [{ ...newData }, ...prev.filter((_data) => !isSameTokenData(_data, newData))]);
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
    setOwnedTokenData((prev) => prev.filter((_data) => !isSameTokenData(_data, newData)));
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
