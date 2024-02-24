import { ActivityIndicator, Dialog } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker"; // Import DocumentPicker
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../infrastructure/theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import { showToast } from "../utils/commonFunctions";
import {
  addDocument,
  updateArrays,
  updateDocument,
  uploadDocument,
  uploadImage, // Import the document upload function
} from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { getDownloadURL } from "firebase/storage";
export default function AddDocumentDialog({ visible, onDismiss, folderId }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log(selectedDocument);
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allow all document types, you can specify specific types here
      });

      // if (result.type === "success" && result.uri) {
      setSelectedDocument(result);
      // }
    } catch (e) {
      console.log(e);
    }
  };

  async function onAdd() {
    console.log("adding");
    if (selectedDocument) {
      try {
        setLoading(true);
        console.log("selectedDocument.assets.uri", selectedDocument.assets.uri);
        const snapshot = await uploadDocument(
          `tabs/${folderId}/documents/${selectedDocument.assets[0].name}`,
          selectedDocument.assets[0].uri,
          selectedDocument.assets[0].name
        );

        showToast("success", "Document added!");
        onDismiss();
        setLoading(false);
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
      <Dialog.Title>Add a Document</Dialog.Title>
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
          onPress={pickDocument}
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
          {selectedDocument ? (
            <View
              style={{
                height: "90%",
                width: "100%",
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "gray",
                borderWidth: 2,
                borderColor: theme.colors.brand.primary,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                {selectedDocument.assets[0].name}
              </Text>
            </View>
          ) : (
            <Image
              source={require("../../assets/placeholder.png")}
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
