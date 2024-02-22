import { Text } from "react-native";
import { theme } from "../infrastructure/theme";

export default function Heading({ title }) {
  return (
    <Text
      style={{
        fontSize: theme.fontSizes.h5,
        fontFamily: theme.fonts.heading,
        fontWeight: "bold",
      }}
    >
      {title}
    </Text>
  );
}
