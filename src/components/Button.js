import { Button as RNPButton } from "react-native-paper";
import { theme } from "../infrastructure/theme";
export default function Button({ title, onPress, loading }) {
  return (
    <RNPButton
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={loading}
      style={{ width: "100%", marginVertical: 10 }}
      buttonColor={theme.colors.brand.primary}
    >
      {title}
    </RNPButton>
  );
}
