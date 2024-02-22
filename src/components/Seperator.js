import { View } from "react-native";
import { theme } from "../infrastructure/theme";

export default function Sepreator() {
  return (
    <View
      style={{
        height: "0.5%",
        backgroundColor: theme.colors.ui.disabled,
        marginVertical: 10,
        zIndex: -1,
      }}
    />
  );
}
