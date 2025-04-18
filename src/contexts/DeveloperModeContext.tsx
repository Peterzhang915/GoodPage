"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface DeveloperModeContextProps {
  isDeveloperToolsUIVisible: boolean;
  setIsDeveloperToolsUIVisible: Dispatch<SetStateAction<boolean>>;
}

const DeveloperModeContext = createContext<
  DeveloperModeContextProps | undefined
>(undefined);

export const DeveloperModeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDeveloperToolsUIVisible, setIsDeveloperToolsUIVisible] =
    useState(false);

  return (
    <DeveloperModeContext.Provider
      value={{
        isDeveloperToolsUIVisible,
        setIsDeveloperToolsUIVisible,
      }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
};

export const useDeveloperMode = (): DeveloperModeContextProps => {
  const context = useContext(DeveloperModeContext);
  if (context === undefined) {
    throw new Error(
      "useDeveloperMode must be used within a DeveloperModeProvider",
    );
  }
  return context;
};
