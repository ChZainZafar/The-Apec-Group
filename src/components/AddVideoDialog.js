import { ActivityIndicator, Dialog } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { theme } from "../infrastructure/theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import { showToast } from "../utils/commonFunctions";
import { addDocument, updateArrays, uploadImage } from "../config/firebase";
import { Video, ResizeMode } from "expo-av";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { getDownloadURL } from "firebase/storage";
import VideoPlaceholder from "../../assets/VideoPlaceholder.png";

export default function AddVideoDialog({ visible, onDismiss, folderId }) {
  const [tabVideo, setTabVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  //   const [status, setStatus] = useState({});
  const pickVideo = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        aspect: [4, 3],
        quality: 0.2,
        allowsMultipleSelection: false,
      });

      setTabVideo(result.assets[0]);
    } catch (e) {
      console.log(e);
    }
  };
  async function onAdd() {
    console.log("adding");
    if (tabVideo && tabVideo.uri) {
      try {
        setLoading(true);
        const snapshot = await uploadImage(
          `tabs/${folderId}/videos/${tabVideo.fileName}`,
          tabVideo.uri
        );
        console.log("video uploaded");

        showToast("success", "Video added!");
        onDismiss();
      } catch (e) {
        setLoading(false);
        console.log(e.message);
        showToast("error", `${e.message}`);
      }
    } else {
      showToast("error", "Please select an image");
      console.log("noImage");
    }
  }
  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      style={{
        height: "80%",
        backgroundColor: theme.colors.ui.quaternary,
      }}
    >
      {loading && (
        <View
          style={{
            backgroundColor: "gray",
            opacity: 0.5,
            position: "absolute",
            top: -24,
            bottom: 0,
            right: 0,
            left: 0,
            zIndex: 1000,
            borderRadius: 30,
          }}
        />
      )}
      <Dialog.Title>Add a Video</Dialog.Title>
      <Dialog.Content style={{ height: "90%", width: "100%" }}>
        {loading && (
          <View
            style={{
              position: "absolute",
              top: "48%",
              left: "49%",
              zIndex: 100,
            }}
          >
            <ActivityIndicator
              size={"large"}
              color={theme.colors.brand.primary}
              style={{ zIndex: 3000 }}
            />
          </View>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.ui.quaternary,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={pickVideo}
          disabled={loading}
        >
          {tabVideo && tabVideo.uri ? (
            <Video
              style={{ height: "90%", width: "100%", alignSelf: "center" }}
              source={{
                uri: tabVideo.uri,
              }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              //    onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
          ) : (
            <Image
              source={VideoPlaceholder}
              style={{
                height: "90%",
                width: "100%",
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
        <Icon
          name="arrow-circle-right"
          size={50}
          color={"green"}
          onPress={onAdd}
          style={{ position: "absolute", bottom: 30, right: 10 }}
          disabled={loading}
        />
      </Dialog.Content>
    </Dialog>
  );
}
