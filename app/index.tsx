import { LoadingScreen } from "@/components";

// This component is now just a fallback. The actual navigation
// happens in _layout.tsx to keep the splash screen visible during initialization.
export default function Index() {
  return <LoadingScreen />;
}
