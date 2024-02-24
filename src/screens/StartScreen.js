import { Image, LogBox, TouchableOpacity } from "react-native";

export default function StartScreen({ navigation, route }) {
  LogBox.ignoreLogs(["new NativeEventEmitter"]);
  const { isStart } = route.params || {};
  const logo_anomation = require("../../assets/Logo_animation.gif");
  return (
    <>
      {isStart ? (
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          onPress={() => {
            navigation.navigate("SigninScreen", {
              usertype: "customer",
              isAdmin: false,
            });
          }}
        >
          <Image
            source={logo_anomation}
            style={{ height: "100%", width: "100%" }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          onPress={() => {
            navigation.navigate("HomeScreen");
          }}
        >
          <Image
            source={logo_anomation}
            style={{ height: "100%", width: "100%" }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </>
  );
}
