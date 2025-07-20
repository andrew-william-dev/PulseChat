import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState('#3b82f6');

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      <div style={{ '--theme-color': themeColor }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
