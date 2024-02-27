import { LogBox, TouchableOpacity, View } from "react-native";
import { Video, ResizeMode } from "expo-av";

export default function StartScreen({ navigation, route }) {
  LogBox.ignoreLogs(["new NativeEventEmitter"]);
  const { isStart } = route.params || {};
  const StartAnimation = () => {
    return (
      <Video
        style={{
          height: 300,
          width: 300,
        }}
        source={require("../../assets/intro.mp4")}
        shouldPlay
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
      />
    );
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
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
          <StartAnimation />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          onPress={() => {
            navigation.navigate("HomeScreen");
          }}
        >
          <StartAnimation />
        </TouchableOpacity>
      )}
    </View>
  );
}
