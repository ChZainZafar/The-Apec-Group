import React, { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import VideoPlayer from "expo-video-player";
import * as ScreenOrientation from "expo-screen-orientation";

export default function VideoPlayerScreen({ route }) {
  const { path } = route.params;
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );

  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions(Dimensions.get("window"));
    };

    // Update dimensions when orientation changes
    const subscription =
      ScreenOrientation.addOrientationChangeListener(updateDimensions);

    // Update dimensions when screen size changes (e.g., multi-window mode)
    Dimensions.addEventListener("change", updateDimensions);

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
      Dimensions.removeEventListener("change", updateDimensions);
    };
  }, []);

  const videoStyle = {
    width: screenDimensions.width,
    height: screenDimensions.height,
  };

  return (
    <View style={styles.container}>
      <VideoPlayer
        style={videoStyle}
        videoProps={{
          shouldPlay: true,
          resizeMode: "contain",
          source: {
            uri: path,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // You can remove videoLandscape if you're calculating dimensions dynamically
});
