import Icon from "react-native-vector-icons/MaterialIcons";
import { theme } from "../infrastructure/theme";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import * as Sharing from "expo-sharing";
import { useContext, useEffect, useState } from "react";
import AddImageDialog from "../components/AddImageDialog";
import AddVideoDialog from "../components/AddVideoDialog";
import AddDocumentDialog from "../components/AddDocumentDialog.js";

import Toast from "react-native-toast-message";
import { ActivityIndicator, RadioButton } from "react-native-paper";
import VideoPlayer from "expo-video-player";
import { ResizeMode } from "expo-av";
import Sepreator from "../components/Seperator";
import { UserContext } from "../context/UserContext";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
export default function FolderContentScreen({ route, navigation }) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [images, setImages] = useState(null);
  const [videos, setVideos] = useState(null);

  const [documents, setDocuments] = useState(null);

  const [checked, setChecked] = useState("Images");
  const folder = (route?.params || {})?.folder;
  const [updatedFolder, setUpdatedFolder] = useState(folder ? folder : null);
  const { usertype } = useContext(UserContext);
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;
  const listFiles = async (path, callback) => {
    try {
      const fullDirUri = FileSystem.documentDirectory + path;
      const items = await FileSystem.readDirectoryAsync(fullDirUri);
      const files = [];

      for (const item of items) {
        console.log("item", item);
        const itemUri = `${fullDirUri}/${item}`;
        console.log(itemUri);
        const info = await FileSystem.getInfoAsync(itemUri);
        if (!info.isDirectory) {
          files.push(item);
        }
      }

      // console.log("Files:", files);
      callback(files);
      return files;
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  };
  useEffect(() => {
    async function setContent() {
      if (folder) {
        await listFiles(`tabs/${folder}/images`, setImages);
        await listFiles(`tabs/${folder}/videos`, setVideos);
        await listFiles(`tabs/${folder}/documents`, setDocuments);
      }
    }
    setContent();
  }, [folder]);
  async function openPdf(uri) {
    try {
      const cUri = await FileSystem.getContentUriAsync(uri);
      if (Platform.OS == "ios")
        await Sharing.shareAsync(cUri, { UTI: "public.item" });
      else
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: cUri,
          flags: 1,
          type: "application/pdf",
        });
    } catch (e) {
      console.log(e.message);
    }
  }
  return (
    <View style={{ width: "100%", height: "100%", paddingHorizontal: "8%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 16 }}>Images</Text>
          <RadioButton
            value="Images"
            status={checked === "Images" ? "checked" : "unchecked"}
            onPress={() => setChecked("Images")}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 16 }}>Videos</Text>
          <RadioButton
            value="Videos"
            status={checked === "Videos" ? "checked" : "unchecked"}
            onPress={() => setChecked("Videos")}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 16 }}>Documents</Text>
          <RadioButton
            value="Documents"
            status={checked === "Documents" ? "checked" : "unchecked"}
            onPress={() => setChecked("Documents")}
          />
        </View>
      </View>
      <Sepreator />
      {checked == "Images" && images && (
        <FlatList
          data={images}
          style={{ marginBottom: "2%" }}
          numColumns={3}
          renderItem={({ item }) => {
            // console.log("item: ", item);
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("FullScreen", {
                    url: item,
                    contentType: "image",
                  });
                }}
                style={{ flex: 1, aspectRatio: 1, margin: 1 }}
              >
                <Image
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  source={{
                    uri: `${FileSystem.documentDirectory}/tabs/${folder}/images/${item}`,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          }}
        />
      )}
      {checked == "Videos" && videos && (
        <FlatList
          data={videos}
          style={{ marginBottom: "2%" }}
          numColumns={Math.floor(windowWidth / 150)}
          renderItem={({ item }) => {
            // console.log("item", item);
            return (
              <VideoPlayer
                videoProps={{
                  shouldPlay: false,
                  resizeMode: ResizeMode.CONTAIN,

                  source: {
                    uri: `${FileSystem.documentDirectory}/tabs/${folder}/videos/${item}`,
                  },
                }}
                style={{ flex: 1, aspectRatio: 1, margin: 1 }}
              />
            );
          }}
        />
      )}
      {checked == "Documents" && documents && (
        <FlatList
          data={documents}
          style={{ marginBottom: "2%" }}
          renderItem={({ item }) => {
            return (
              <>
                <TouchableOpacity
                  style={{
                    width: "100%",
                    backgroundColor: "#e0e0e0",
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderWidth: 2,
                    borderColor: theme.colors.brand.primary,
                  }}
                  onPress={() => {
                    // Linking.openURL(
                    //   `http://gahp.net/wp-content/uploads/2017/09/sample.pdf`
                    // );
                    // navigation.navigate("PdfOpenerScreen", {
                    //   uri: `${FileSystem.documentDirectory}/tabs/${folder}/documents/${item}`,
                    // });
                    openPdf(
                      `${FileSystem.documentDirectory}/tabs/${folder}/documents/${item}`
                    );
                  }}
                >
                  <Text syle={{ fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
                <Sepreator />
              </>
            );
          }}
        />
      )}
      <Toast />

      {usertype == "admin" && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            // elevation: 2,
          }}
        >
          {checked == "Images" && (
            <Icon
              name="image"
              size={50}
              color={theme.colors.brand.primary}
              onPress={() => {
                setIsImageDialogOpen(true);
              }}
            />
          )}
          {checked == "Videos" && (
            <Icon
              name="video-call"
              size={60}
              color={theme.colors.brand.primary}
              onPress={() => {
                setIsVideoDialogOpen(true);
              }}
            />
          )}
          {checked == "Documents" && (
            <Icon
              name="edit-document"
              size={50}
              color={theme.colors.brand.primary}
              onPress={() => {
                setIsDocumentDialogOpen(true);
              }}
            />
          )}
        </View>
      )}
      {usertype == "employee" && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            // elevation: 2,
          }}
        >
          {checked == "Images" && (
            <Icon
              name="image"
              size={50}
              color={theme.colors.brand.primary}
              onPress={() => {
                setIsImageDialogOpen(true);
              }}
            />
          )}
          {checked == "Videos" && (
            <Icon
              name="video-call"
              size={60}
              color={theme.colors.brand.primary}
              onPress={() => {
                setIsVideoDialogOpen(true);
              }}
            />
          )}
          {checked == "Documents" && (
            <Icon
              name="edit-document"
              size={50}
              color={theme.colors.brand.primary}
            />
          )}
        </View>
      )}
      <AddImageDialog
        visible={isImageDialogOpen}
        onDismiss={() => {
          setIsImageDialogOpen(false);
        }}
        folderId={folder}
        // setUpdatedFolder={setUpdatedFolder}
        // updatedFolder={updatedFolder}
      />
      <AddDocumentDialog
        visible={isDocumentDialogOpen}
        onDismiss={() => {
          setIsDocumentDialogOpen(false);
        }}
        folderId={updatedFolder}
      />
      <AddVideoDialog
        visible={isVideoDialogOpen}
        onDismiss={() => {
          setIsVideoDialogOpen(false);
        }}
        folderId={folder}
      />
      {checked == "Images" && images && (images?.length ?? 0) == 0 && (
        <View
          style={{
            position: "absolute",
            top: "40%",
            alignSelf: "center",
            zIndex: -1,
          }}
        >
          <Text style={{ fontSize: theme.fontSizes.h5, fontWeight: "bold" }}>
            No images found!
          </Text>
        </View>
      )}
      {checked == "Videos" && videos && (videos?.length ?? 0) == 0 && (
        <View
          style={{
            position: "absolute",
            top: "40%",
            alignSelf: "center",
            zIndex: -1,
          }}
        >
          <Text style={{ fontSize: theme.fontSizes.h5, fontWeight: "bold" }}>
            No videos found!
          </Text>
        </View>
      )}
    </View>
  );
}
