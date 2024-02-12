import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import Button from "../components/Button";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { theme } from "../infrastructure/theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import AddTabDialog from "../components/AddTabDialog";
import Toast from "react-native-toast-message";
import { getAllDocuments } from "../config/firebase";
import { ActivityIndicator } from "react-native-paper";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  getMetadata,
} from "firebase/storage";
import * as FileSystem from "expo-file-system";
import { showToast } from "../utils/commonFunctions.js";

const windowWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
  const { usertype } = useContext(UserContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [folders, setFolders] = useState(null);
  const [folderId, setFolderId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const BASEURL_TABS = "gs://fir-db-project-798a3.appspot.com/tabs";

  async function makeDirectory(path) {
    const dirUri = FileSystem.documentDirectory + path;
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  }

  const getListOfFolders = async (path) => {
    const storage = getStorage(); // Get a reference to the storage service
    const storageRef = ref(storage, path); // Create a reference to the desired path

    try {
      const result = await listAll(storageRef); // List all items and prefixes under this reference

      const folders = result.prefixes; // `prefixes` contains references to folders
      const folderNames = folders.map((folderRef) => {
        // Extract the folder name from the full path
        const fullPath = folderRef.fullPath;
        const nameParts = fullPath.split("/");
        return nameParts[nameParts.length - 1]; // Return the last part as the folder name
      });

      return folderNames; // Returns an array of folder names
    } catch (error) {
      console.error("Failed to list folders:", error);
      throw error; // Rethrow or handle as needed
    }
  };
  const getFilesInSubfolder = async (folderPath) => {
    const storage = getStorage();
    const folderRef = ref(storage, folderPath);

    try {
      const result = await listAll(folderRef);
      const files = result.items; // `items` contains references to files in the folder

      const fileNames = files.map((fileRef) => {
        // Extract the file name from the full path
        const fullPath = fileRef.fullPath;
        const nameParts = fullPath.split("/");
        return nameParts[nameParts.length - 1]; // Return the last part as the file name
      });

      return fileNames; // Returns an array of file names
    } catch (error) {
      console.error("Failed to list files in subfolder:", error);
      throw error; // Rethrow or handle as needed
    }
  };

  const ensureDirExists = async (path) => {
    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) {
      console.log("Directory doesn't exist, creating...");
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  };

  const downloadFile = async (path, fileUrl, fileRef) => {
    try {
      const metadata = await getMetadata(fileRef);
      let extension = metadata.contentType.split("/");
      if (extension.length > 0) {
        if (["pdf", "plain"].includes(extension[1])) extension = "";
        else if (extension[1] == "quicktime") extension = ".mp4";
        else if (metadata.fullPath.search("icon") != -1) extension = ".jpeg";
        else extension = `.${extension[1]}`;
      } else throw "";

      const dirUri =
        FileSystem.documentDirectory + path.substring(0, path.lastIndexOf("/"));
      await ensureDirExists(dirUri); // Ensure the directory exists
      const fileUri = FileSystem.documentDirectory + path + (extension || "");
      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
      console.log("File downloaded to:", downloadResult.uri);
      return downloadResult.uri;
    } catch (error) {
      console.error("Error downloading file:", error);
      return null;
    }
  };
  async function syncData() {
    setIsSyncing(true);
    const folderPath = `${FileSystem.documentDirectory}/tabs`;
    try {
      await FileSystem.deleteAsync(folderPath, { idempotent: true });
      console.log("Folder deleted successfully");
      showToast("success", "Folder deleted successfully!");
    } catch (error) {
      console.error("Error deleting folder:", error);
      showToast("error", `Failed to delete folder: ${error.message}`);
    }
    showToast("success", "Syncing...", "Please do not close this screen");
    const storage = getStorage();
    console.log("_____________________________________________________");
    const tabNames = await getListOfFolders(BASEURL_TABS);

    for (let tabIndex = 0; tabIndex < tabNames.length; tabIndex++) {
      const imagesNames = await getFilesInSubfolder(
        `${BASEURL_TABS}/${tabNames[tabIndex]}/images`
      );

      const videosNames = await getFilesInSubfolder(
        `${BASEURL_TABS}/${tabNames[tabIndex]}/videos`
      );

      const documentsNames = await getFilesInSubfolder(
        `${BASEURL_TABS}/${tabNames[tabIndex]}/documents`
      );

      if (imagesNames.length > 0) {
        for (
          let imageIndex = 0;
          imageIndex < imagesNames.length;
          imageIndex++
        ) {
          let imagePath = `tabs/${tabNames[tabIndex]}/images/${imagesNames[imageIndex]}`;
          let imagePathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/images/${imagesNames[imageIndex]}`;
          const fileRef = ref(storage, imagePathS);
          const downloadUrl = await getDownloadURL(fileRef);
          await downloadFile(imagePath, downloadUrl, fileRef);
        }
      } else {
        makeDirectory(`tabs/${tabNames[tabIndex]}/images`);
      }

      if (videosNames.length > 0) {
        for (
          let videoIndex = 0;
          videoIndex < videosNames.length;
          videoIndex++
        ) {
          let videoPath = `tabs/${tabNames[tabIndex]}/videos/${videosNames[videoIndex]}`;
          let videoPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/videos/${videosNames[videoIndex]}`;
          const fileRef = ref(storage, videoPathS);
          const downloadUrl = await getDownloadURL(fileRef);
          await downloadFile(videoPath, downloadUrl, fileRef);
        }
      } else {
        makeDirectory(`tabs/${tabNames[tabIndex]}/videos`);
      }

      if (documentsNames.length > 0) {
        for (
          let documentIndex = 0;
          documentIndex < documentsNames.length;
          documentIndex++
        ) {
          let documentPath = `tabs/${tabNames[tabIndex]}/documents/${documentsNames[documentIndex]}`;
          let documentPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/documents/${documentsNames[documentIndex]}`;
          const fileRef = ref(storage, documentPathS);
          const downloadUrl = await getDownloadURL(fileRef);
          await downloadFile(documentPath, downloadUrl, fileRef);
        }
      } else {
        makeDirectory(`tabs/${tabNames[tabIndex]}/documents`);
      }
      const filesInTab = await getFilesInSubfolder(
        `${BASEURL_TABS}/${tabNames[tabIndex]}`
      );
      console.log("filesInTab", filesInTab);
      let iconPath = `tabs/${tabNames[tabIndex]}/icon`;
      let iconPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/${filesInTab[0]}`;
      const fileRef = ref(storage, iconPathS);
      const downloadUrl = await getDownloadURL(fileRef);
      await downloadFile(iconPath, downloadUrl, fileRef);
    }
    setIsSyncing(false);
    getTabsL();
  }

  const listSubdirectories = async (path) => {
    try {
      const fullDirUri = FileSystem.documentDirectory + path;
      const items = await FileSystem.readDirectoryAsync(fullDirUri);
      const directories = [];
      console.log("items", items);
      for (const item of items) {
        const itemUri = `${fullDirUri}/${item}`;
        const info = await FileSystem.getInfoAsync(itemUri);
        if (info.isDirectory) {
          directories.push(item);
        }
      }

      console.log("Subdirectories:", directories);
      return directories;
    } catch (error) {
      console.error("Error listing subdirectories:", error);
      return [];
    }
  };

  async function getTabsL() {
    const tabNames = await listSubdirectories("tabs");

    setFolders(tabNames);
  }
  useEffect(() => {
    getTabsL();
  }, []);
  console.log("folders", folders);
  return (
    <View style={{ flex: 1, width: "100%", paddingHorizontal: 15 }}>
      <Toast />

      {folders == null || isSyncing == true ? (
        <View
          style={{
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator
            animating={true}
            color={theme.colors.brand.primary}
          />
        </View>
      ) : folders.length < 1 ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.fontSizes.h3,
            }}
          >
            There are no folders added!
          </Text>
        </View>
      ) : (
        <FlatList
          data={folders.sort(
            (a, b) => parseInt(a.split("_")[0]) - parseInt(b.split("_")[0])
          )}
          numColumns={Math.floor(windowWidth / 150)} // Adjust the constant value as needed
          renderItem={({ item }) => {
            console.log(`${FileSystem.documentDirectory}tabs/${item}/icon`);
            return (
              <TouchableOpacity
                style={{ flex: 1, margin: 0 }} // Adjust the margin as needed
                onPress={() => {
                  navigation.navigate("FolderContentScreen", {
                    folder: item,
                  });
                }}
              >
                <Image
                  source={{
                    uri:
                      `${FileSystem.documentDirectory}tabs/${item}/icon` +
                      (Platform.OS == "ios" ? ".jpeg" : ""),
                  }}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.1)",
                    margin: 1,
                    marginBottom: 2,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View
        style={{
          position: "absolute",
          bottom: "4%",
          right: "4%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "transparent", // Set background color to transparent
        }}
      >
        {usertype == "admin" && (
          <Icon
            name="add-circle"
            size={50}
            color={theme.colors.brand.primary}
            style={{ marginHorizontal: 10 }}
            onPress={() => {
              setIsAddDialogOpen(true);
            }}
          />
        )}

        <Icon
          name="sync"
          size={40}
          color={"white"}
          style={{
            marginHorizontal: 10,
            padding: 2,
            backgroundColor: theme.colors.brand.primary,
            borderRadius: 50,
            alignSelf: "center",
          }}
          onPress={() => {
            syncData();
          }}
        />
      </View>

      <AddTabDialog
        visible={isAddDialogOpen}
        onDismiss={() => {
          setIsAddDialogOpen(false);
        }}
        setFolderId={setFolderId}
      />
    </View>
  );
}
