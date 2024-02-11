import { TextInput as RNPTextInput } from "react-native-paper";
import { theme } from "../infrastructure/theme";

export default function TextInput({ label, value, setValue }) {
  return (
    <RNPTextInput
      label={label}
      value={value}
      onChangeText={(text) => setValue(text)}
      mode="outlined"
      selectionColor={theme.colors.brand.primary}
      underlineColor={theme.colors.brand.primary}
      outlineColor={theme.colors.brand.primary}
      activeOutlineColor={theme.colors.brand.primary}
      activeUnderlineColor={theme.colors.brand.primary}
      autoCapitalize="none"
      style={{ width: "100%", alignSelf: "center", marginVertical: 3 }}
    />
  );
}
