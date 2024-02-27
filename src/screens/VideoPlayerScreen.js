import React from "react";
import { Video, ResizeMode } from "expo-av";

export default function VideoPlayerScreen({ route }) {
  const { path } = route.params;

  return (
    <Video
      style={{
        flex: 1,
      }}
      source={{
        uri: path,
      }}
      shouldPlay
      useNativeControls
      resizeMode={ResizeMode.COVER}
    />
  );
}
