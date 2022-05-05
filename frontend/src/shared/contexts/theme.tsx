import { createContext, ReactNode, useContext, useState } from 'react';

type ThemeType = 'lofi' | 'black';

interface ContextState {
  theme: ThemeType;
  setTheme: (value: ThemeType) => void;
}

const ThemeContext = createContext({} as ContextState);

const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('lofi');
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeContextProvider;
