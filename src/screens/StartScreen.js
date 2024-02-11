import { Image, LogBox, TouchableOpacity } from "react-native";
import Logo from "../components/Logo";

export default function StartScreen({ navigation }) {
  LogBox.ignoreLogs(["new NativeEventEmitter"]);
  return (
    <TouchableOpacity
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      onPress={() => {
        navigation.navigate("SigninScreen", {
          usertype: "customer",
          isAdmin: false,
        });
      }}
    >
      <Logo height="100%" width="100%" />
    </TouchableOpacity>
  );
}
