import { Image } from "react-native";

export default function Logo({ height, width }) {
  return (
    <Image
      style={{ height: height, width: width }}
      source={require("../../assets/Logo.jpg")}
      resizeMode="contain"
    />
  );
}
