import { ResizeMode } from "expo-av";
import VideoPlayer from "expo-video-player";
import * as FileSystem from "expo-file-system";
import { Text } from "react-native";

export default function VideoPlayerScreen({ route }) {
  const { path } = route.params;
  return (
    <VideoPlayer
      videoProps={{
        shouldPlay: true,
        resizeMode: ResizeMode.CONTAIN,

        source: {
          uri: path,
        },
      }}
      //   fullscreen={{ visible: true }}
    />
  );
}
