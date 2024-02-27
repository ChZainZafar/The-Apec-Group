import { ActivityIndicator, Dialog } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Platform, TouchableOpacity, View } from "react-native";
import { theme } from "../infrastructure/theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import { showToast } from "../utils/commonFunctions";
import {
  addDocument,
  updateArrays,
  updateDocument,
  uploadImage,
} from "../config/firebase";

import Placeholder from "../../assets/Placeholder.png";
export default function AddImageDialog({ visible, onDismiss, folderId }) {
  const [tabImage, setTabImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 0.2,
        allowsMultipleSelection: false,
      });
      console.log(result);
      setTabImage(result.assets[0]);
    } catch (e) {
      console.log(e);
    }
  };
  // console.log(updatedFolder);
  async function onAdd() {
    console.log("adding");
    if (tabImage && tabImage.uri) {
      try {
        setLoading(true);
        const snapshot = await uploadImage(
          `tabs/${folderId}/images/${tabImage.fileName}`,
          tabImage.uri
        );
        console.log("image uploaded");
        // const url = await getDownloadURL(snapshot.ref);
        // await updateArrays(
        //   firestoreCollections.TABS_COLLECTION,
        //   folderId,
        //   "image",
        //   url
        // );
        setLoading(false);
        console.log("added");
        // const updatedImages = [...updatedFolder.images, url];

        // setUpdatedFolder({ ...updatedFolder, images: updatedImages });
        showToast("success", "Image added!");
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
      <Dialog.Title>Add a Image</Dialog.Title>
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
          onPress={pickImage}
          disabled={loading}
        >
          {loading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          )}
          {tabImage && tabImage.uri ? (
            <Image
              source={{ uri: tabImage.uri }}
              style={{
                height: "90%",
                width: "100%",
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require("../../assets/Placeholder.png")}
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
