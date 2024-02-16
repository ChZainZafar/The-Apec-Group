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
import * as Device from "expo-device";

export default function HomeScreen({ navigation }) {
  const { usertype } = useContext(UserContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [folders, setFolders] = useState(null);
  const [folderId, setFolderId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get("window"));

  const onChange = () => {
    setScreenData(Dimensions.get("window"));
  };

  useEffect(() => {
    Dimensions.addEventListener("change", onChange);
    return () => Dimensions.removeEventListener("change", onChange);
  }, []);

  // Determine if the current orientation is landscape
  const isLandscape = screenData.width > screenData.height;
  useEffect(() => {
    const thresholdWidth = 768; // You can adjust this threshold as needed
    setIsLargeScreen(Math.min(windowWidth, windowHeight) >= thresholdWidth);
  }, []);

  const numColumns = 2;

  const BASEURL_TABS = "gs://the-apec-group.appspot.com/tabs";
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
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
      // console.log("Directory doesn't exist, creating...");
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
        else if (metadata.fullPath.search("icon") != -1)
          extension = Platform.OS == "ios" ? ".jpeg" : "";
        else extension = `.${extension[1]}`;
      } else throw "";

      const dirUri =
        FileSystem.documentDirectory + path.substring(0, path.lastIndexOf("/"));
      await ensureDirExists(dirUri); // Ensure the directory exists
      const fileUri = FileSystem.documentDirectory + path + (extension || "");
      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
      // console.log("File downloaded to:", downloadResult.uri);
      return downloadResult.uri;
    } catch (error) {
      console.error("Error downloading file:", error);
      return null;
    }
  };
  const listFolders = async (path) => {
    const dirInfo = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + path
    );

    if (dirInfo.exists) {
      try {
        const fullDirUri = FileSystem.documentDirectory + path;
        // console.log("FULL URI", fullDirUri);
        const items = await FileSystem.readDirectoryAsync(fullDirUri);
        const folders = [];

        if (items.length > 0) {
          // console.log("items", items);
          for (const item of items) {
            const itemUri = `${fullDirUri}/${item}`;
            const info = await FileSystem.getInfoAsync(itemUri);
            if (info.isDirectory) {
              folders.push(item);
            }
          }
        } else {
          console.log("No items found");
        }
        return folders;
      } catch (error) {
        console.error("Error listing folders:", error);
        return [];
      }
    } else {
      console.log("Dir does not exist: ", path);
      return [];
    }
  };
  const listFiles = async (path) => {
    const dirInfo = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + path
    );

    if (dirInfo.exists) {
      try {
        const fullDirUri = FileSystem.documentDirectory + path;
        // console.log("FULL URI", fullDirUri);
        const items = await FileSystem.readDirectoryAsync(fullDirUri);
        const files = [];

        if (items.length > 0) {
          console.log("LOCAL FILES GOT: ", items);
          for (const item of items) {
            // console.log("item", item);
            const itemUri = `${fullDirUri}/${item}`;
            // console.log(itemUri);
            const info = await FileSystem.getInfoAsync(itemUri);
            if (!info.isDirectory) {
              files.push(item);
            }
          }
        } else {
          console.log("No items got");
        }
        // console.log("Files:", files);
        return files;
      } catch (error) {
        console.error("Error listing files:", error);
        return [];
      }
    } else {
      console.log("Dir does not exists: ", path);

      return [];
    }
  };
  function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }
  function removeTextAfterLastDot(text) {
    // if (arr.length > 0) {
    // return arr.map((item) => {
    // Find the last index of the dot character
    const lastIndex = text.lastIndexOf(".");
    // If there's no dot, return the item as is
    if (lastIndex === -1) return text;
    // Otherwise, return the substring up to the last dot
    return text.substring(0, lastIndex);
    // });
    // } else {
    //   return arr;
    // }
  }

  function ifInclude(arr, text, type) {
    console.log("IF INCLUDE: ARRAY: ", arr, "TEXT", text);
    for (let arrIndex = 0; arrIndex < arr.length; arrIndex++) {
      if (type == "documents") {
        if (arr[arrIndex] == text) {
          return true;
        }
      } else {
        if (removeTextAfterLastDot(arr[arrIndex]) == text) {
          return true;
        }
      }
    }
    return false;
  }

  function ifRemove(arr, text, type) {
    for (let arrIndex = 0; arrIndex < arr.length; arrIndex++) {
      // console.log(
      //   "removeTextAfterLastDot(arr[arrIndex]",
      //   removeTextAfterLastDot(arr[arrIndex])
      // );
      // console.log("text", text);
      if (type == "documents") {
        if (arr[arrIndex] == text) {
          return arrIndex;
        }
      } else {
        if (removeTextAfterLastDot(arr[arrIndex]) == text) {
          return arrIndex;
        }
      }
    }
    return -1;
  }

  async function matchAndDownload(
    localArray,
    globalArray,
    tabNameIndex,
    subFolderName
  ) {
    const storage = getStorage();
    if (globalArray.length > 0) {
      console.log(`LOCAL ${subFolderName} ARRAY`, localArray);
      console.log(`GLOBAL ${subFolderName} ARRAY`, globalArray);
      for (let index = 0; index < globalArray.length; index++) {
        if (!ifInclude(localArray, globalArray[index], subFolderName)) {
          try {
            let imagePath = `tabs/${tabNameIndex}/${subFolderName}/${globalArray[index]}`;
            let imagePathS = `${BASEURL_TABS}/${tabNameIndex}/${subFolderName}/${globalArray[index]}`;
            const fileRef = ref(storage, imagePathS);
            const downloadUrl = await getDownloadURL(fileRef);
            await downloadFile(imagePath, downloadUrl, fileRef);

            localArray = removeItemOnce(
              localArray,
              localArray[
                ifRemove(localArray, globalArray[index], subFolderName)
              ]
            );
            console.log("downloaded file", globalArray[index]);
          } catch (e) {
            console.log(e);
          }
        } else {
          console.log("already exist", globalArray[index]);
          localArray = removeItemOnce(
            localArray,
            localArray[ifRemove(localArray, globalArray[index], subFolderName)]
          );
        }
      }

      if (localArray.length > 0) {
        console.log("there is something to delete in local", localArray);
        for (
          let localImageIndex = 0;
          localImageIndex < localArray.length;
          localImageIndex++
        ) {
          await FileSystem.deleteAsync(
            `${FileSystem.documentDirectory}/tabs/${tabNameIndex}/${subFolderName}/${localArray[localImageIndex]}`,
            { idempotent: true }
          );
        }
      }
    } else {
      makeDirectory(`tabs/${tabNameIndex}/${subFolderName}`);
    }
  }

  async function deleteFolders() {
    const folderPath = `${FileSystem.documentDirectory}/tabs`;
    try {
      await FileSystem.deleteAsync(folderPath, { idempotent: true });
      console.log("Folder deleted successfully");
      showToast("success", "Folder deleted successfully!");
    } catch (error) {
      console.error("Error deleting folder:", error);
      showToast("error", `Failed to delete folder: ${error.message}`);
    }
  }

  async function syncData() {
    setIsSyncing(true);

    showToast("success", "Syncing...", "Please do not close this screen");
    const storage = getStorage();

    console.log("_____________________________________________________");
    const tabNames = await getListOfFolders(BASEURL_TABS);
    const tabNamesL = await listFolders(`tabs`);
    // console.log("TAB NAMES G", tabNames);
    // console.log("TAB NAMES L", tabNamesL);

    for (
      let localTabIndex = 0;
      localTabIndex < tabNamesL.length;
      localTabIndex++
    ) {
      if (!tabNames.includes(tabNamesL[localTabIndex])) {
        await FileSystem.deleteAsync(
          `${FileSystem.documentDirectory}/tabs/${tabNamesL[localTabIndex]}`,
          { idempotent: true }
        );
      }
    }

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

      let localImages = await listFiles(`tabs/${tabNames[tabIndex]}/images`);
      // localImages = removeTextAfterLastDot(localImages);
      let localVideos = await listFiles(`tabs/${tabNames[tabIndex]}/videos`);
      let localDocuments = await listFiles(
        `tabs/${tabNames[tabIndex]}/documents`
      );
      await matchAndDownload(
        localImages,
        imagesNames,
        tabNames[tabIndex],
        "images"
      );
      await matchAndDownload(
        localVideos,
        videosNames,
        tabNames[tabIndex],
        "videos"
      );
      await matchAndDownload(
        localDocuments,
        documentsNames,
        tabNames[tabIndex],
        "documents"
      );

      // if (videosNames.length > 0) {
      //   for (
      //     let videoIndex = 0;
      //     videoIndex < videosNames.length;
      //     videoIndex++
      //   ) {
      //     let videoPath = `tabs/${tabNames[tabIndex]}/videos/${videosNames[videoIndex]}`;
      //     let videoPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/videos/${videosNames[videoIndex]}`;
      //     const fileRef = ref(storage, videoPathS);
      //     const downloadUrl = await getDownloadURL(fileRef);
      //     await downloadFile(videoPath, downloadUrl, fileRef);
      //   }
      // } else {
      //   makeDirectory(`tabs/${tabNames[tabIndex]}/videos`);
      // }

      // if (documentsNames.length > 0) {
      //   for (
      //     let documentIndex = 0;
      //     documentIndex < documentsNames.length;
      //     documentIndex++
      //   ) {
      //     let documentPath = `tabs/${tabNames[tabIndex]}/documents/${documentsNames[documentIndex]}`;
      //     let documentPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/documents/${documentsNames[documentIndex]}`;
      //     const fileRef = ref(storage, documentPathS);
      //     const downloadUrl = await getDownloadURL(fileRef);
      //     await downloadFile(documentPath, downloadUrl, fileRef);
      //   }
      // } else {
      //   makeDirectory(`tabs/${tabNames[tabIndex]}/documents`);
      // }
      const dirInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + `tabs/${tabNames[tabIndex]}/icon`
      );
      if (!dirInfo.exists) {
        const filesInTab = await getFilesInSubfolder(
          `${BASEURL_TABS}/${tabNames[tabIndex]}`
        );
        let iconPath = `tabs/${tabNames[tabIndex]}/icon`;
        let iconPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/${filesInTab[0]}`;
        const fileRef = ref(storage, iconPathS);
        const downloadUrl = await getDownloadURL(fileRef);
        await downloadFile(iconPath, downloadUrl, fileRef);
      } else {
        // console.log("Tab Icon exists", tabNames[tabIndex]);
      }
    }
    setIsSyncing(false);
    getTabsL();
  }

  const listSubdirectories = async (path) => {
    try {
      const fullDirUri = FileSystem.documentDirectory + path;
      const items = await FileSystem.readDirectoryAsync(fullDirUri);
      const directories = [];
      // console.log("items", items);
      for (const item of items) {
        const itemUri = `${fullDirUri}/${item}`;
        const info = await FileSystem.getInfoAsync(itemUri);
        if (info.isDirectory) {
          directories.push(item);
        }
      }

      // console.log("Subdirectories:", directories);
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
  // console.log("folders", folders);
  return (
    <View style={{ flex: 1, width: "100%", paddingHorizontal: 15 }}>
      <View
        style={{
          zIndex: Number.MAX_SAFE_INTEGER,
        }}
      >
        <Toast />
      </View>

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
          numColumns={numColumns} // Use the state variable
          renderItem={({ item }) => {
            // console.log(`${FileSystem.documentDirectory}tabs/${item}/icon`);
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
                    width: isLandscape
                      ? "100%"
                      : Dimensions.get("window").width / numColumns - 6,
                    // width: "100%",
                    // Optionally adjust the size more specifically for tablets here
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
        {/* <Icon
          name="delete"
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
            deleteFolders();
          }}
        /> */}
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
