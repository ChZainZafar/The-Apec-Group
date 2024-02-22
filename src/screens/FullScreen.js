import VideoPlayer from "expo-video-player";
import { Image, View } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
export default function FullScreen({ route }) {
  const { uris, contentType, index } = route.params;
  console.log(uris);
  return (
    <>
      {contentType == "image" && (
        <View style={{ height: "100%", width: "100%" }}>
          <ImageViewer
            imageUrls={uris.map((img) => ({ url: img }))}
            index={index}
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
