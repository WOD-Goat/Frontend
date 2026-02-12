import { useCallback } from "react";
import { create } from "zustand";

import { GlobalStateControls } from "./types";
import {
  type GlobalStateRegistry,
  defaultState,
} from "../registries/globalState";

export const useZustandGlobalState = create<
  GlobalStateRegistry & { set: (state: Partial<GlobalStateRegistry>) => void }
>((set) => ({
  ...defaultState,
  set: (state) => set(state),
}));

export const useGlobalState = () => {
  const { set: zustandSetter, ...values } = useZustandGlobalState();

  const get: GlobalStateControls["get"] = useCallback(
    (key) => values[key],
    [values]
  );

  const set: GlobalStateControls["set"] = (key, value) =>
    zustandSetter({ [key]: value });

  return {
    get,
    set,
  } satisfies GlobalStateControls;
};
