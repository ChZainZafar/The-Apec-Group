import { Dialog } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { theme } from "../infrastructure/theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import { showToast } from "../utils/commonFunctions";
import { addDocument, uploadImage } from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { getDownloadURL } from "firebase/storage";
import ImagePlaceholder from "../../assets/ImagePlaceholder.png";
import TextInput from "./TextInput.js";
export default function AddTabDialog({ visible, onDismiss, setFolderId }) {
  const [tabImage, setTabImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState("");
  console.log(new Date().toISOString());
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 0.2,
        allowsMultipleSelection: false,
      });

      setTabImage(result.assets[0].uri);
    } catch (e) {
      console.log(e);
    }
  };

  async function onAdd() {
    console.log("adding");
    if (tabImage) {
      try {
        setLoading(true);
        const id = Math.floor(1000000 + Math.random() * 900000);
        await uploadImage(`tabs/${order}_${id}/icon`, tabImage);

        setLoading(false);
        console.log("added");
        setFolderId(id);
        showToast("success", "Folder added!");
        onDismiss();
      } catch (e) {
        setLoading(false);
        console.log(e.message);
        showToast("error", `${e.message}`);
      }
    } else {
      showToast("error", "Please select an image to add the folder");
      console.log("noImage");
    }
  }
  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      style={{
        height: "80%",
        backgroundColor: loading ? "gray" : theme.colors.ui.quaternary,
      }}
    >
      <Dialog.Title>Add a tab</Dialog.Title>
      <Dialog.Content style={{ height: "70%", width: "100%" }}>
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
          {tabImage ? (
            <Image
              source={{ uri: tabImage }}
              style={{
                height: "90%",
                width: "100%",
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={ImagePlaceholder}
              style={{
                height: "90%",
                width: "100%",
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
        <TextInput
          value={order}
          setValue={setOrder}
          label={"Order - (0 being the highest priority)"}
        />
        <Icon
          name="arrow-circle-right"
          size={50}
          color={tabImage && order ? "green" : "gray"}
          onPress={
            tabImage && order
              ? onAdd
              : () => {
                  showToast("error", "Please add an image to continue");
                }
          }
          style={{ position: "absolute", bottom: -60, right: 10 }}
          disabled={loading}
        />
      </Dialog.Content>
    </Dialog>
  );
}
