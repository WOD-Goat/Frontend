import React, { createContext, useContext } from "react";
import { useGlobalState } from "./useGlobalState";
import { GlobalStateControls } from "./types";

// Create a context for the global state
const GlobalStateContext = createContext<GlobalStateControls | undefined>(
  undefined
);

// Provider component that wraps your app and makes global state available
export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalState = useGlobalState();

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
}
