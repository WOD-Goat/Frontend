import { GlobalStateRegistry } from '../registries/globalState';

export type GlobalStateControls = {
  get: <K extends keyof GlobalStateRegistry>(key: K) => GlobalStateRegistry[K];
  set: <K extends keyof GlobalStateRegistry>(key: K, value: GlobalStateRegistry[K]) => void;
};
