import VideoPlayer from "expo-video-player";
import { Image, View } from "react-native";

export default function FullScreen({ route }) {
  const { url, contentType } = route.params;
  console.log(url);
  return (
    <>
      {contentType == "image" && (
        <View style={{ height: "100%", width: "100%" }}>
          <Image
            style={{ height: "100%", width: "100%" }}
            resizeMode="contain"
            source={{ uri: url }}
          />
        </View>
      )}
      {contentType == "video" && (
        <VideoPlayer
          videoProps={{
            shouldPlay: false,
            resizeMode: ResizeMode.CONTAIN,

            source: {
              uri: url,
            },
          }}
          fullscreen={true}
        />
      )}
    </>
  );
}
