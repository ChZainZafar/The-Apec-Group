import { LogBox, TouchableWithoutFeedback, View } from "react-native";
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
        useNativeControls={false}
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
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (isStart)
            navigation.navigate("SigninScreen", {
              usertype: "customer",
              isAdmin: false,
            });
          else navigation.navigate("HomeScreen");
        }}
      >
        <View>
          <StartAnimation />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
