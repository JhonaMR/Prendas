import React, { createContext, useContext, useState, useEffect } from 'react';

interface DarkModeContextType {
  isDark: boolean;
  toggleDark: () => void;
  resetToDark: (value: boolean) => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggleDark: () => {},
  resetToDark: () => {},
});

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false); // Siempre inicia en modo claro

  useEffect(() => {
    localStorage.setItem('dark_mode', String(isDark));
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);
  const resetToDark = (value: boolean) => setIsDark(value);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark, resetToDark }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
