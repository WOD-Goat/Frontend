import { View } from "react-native";

interface GapProps {
  size?: number;
  horizontal?: boolean;
}

export default function Gap({ size = 16, horizontal = false }: GapProps) {
  return (
    <View
      style={{
        width: horizontal ? size : undefined,
        height: horizontal ? undefined : size,
      }}
    />
  );
}
