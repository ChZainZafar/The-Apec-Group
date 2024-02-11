import { Image } from "react-native";

export default function Logo({ height, width }) {
  return (
    <Image
      style={{ height: height, width: width, zIndex: -1 }}
      source={require("../../assets/Logo.png")}
      resizeMode="contain"
    />
  );
}
