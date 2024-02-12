import { Image, LogBox, TouchableOpacity } from "react-native";
// Assuming the path to your GIF file is correct
import Logo_animation from "../../assets/Logo_animation.gif"; // Update the path according to your project structure

export default function StartScreen({ navigation, route }) {
  LogBox.ignoreLogs(["new NativeEventEmitter"]);
  const { isStart } = route.params || {}; // Corrected typo and added a fallback to prevent errors

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
            source={Logo_animation}
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
            source={Logo_animation}
            style={{ height: "100%", width: "100%" }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </>
  );
}
