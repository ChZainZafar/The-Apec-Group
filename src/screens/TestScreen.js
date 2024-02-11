import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { Image, Linking, Text } from "react-native";
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";

export default function TestScreen() {
  const BASEURL_TABS = "gs://fir-db-project-798a3.appspot.com/tabs";
  useEffect(() => {
    async function callFunctions() {
      //   const storage = getStorage();
      //   console.log("_____________________________________________________");
      //   const tabNames = await getListOfFolders(BASEURL_TABS);

      //   for (let tabIndex = 0; tabIndex < tabNames.length; tabIndex++) {
      //     const imagesNames = await getFilesInSubfolder(
      //       `${BASEURL_TABS}/${tabNames[tabIndex]}/images`
      //     );
      //     // console.log("Images in", tabNames[tabIndex], imagesNames);

      //     const videosNames = await getFilesInSubfolder(
      //       `${BASEURL_TABS}/${tabNames[tabIndex]}/videos`
      //     );
      //     // console.log("Videos in", tabNames[tabIndex], videos);

      //     const documentsNames = await getFilesInSubfolder(
      //       `${BASEURL_TABS}/${tabNames[tabIndex]}/documents`
      //     );
      //     // console.log("Documents in", tabNames[tabIndex], documents);

      //     if (imagesNames.length > 0) {
      //       for (
      //         let imageIndex = 0;
      //         imageIndex < imagesNames.length;
      //         imageIndex++
      //       ) {
      //         let imagePath = `tabs/${tabNames[tabIndex]}/images/${imagesNames[imageIndex]}`;
      //         let imagePathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/images/${imagesNames[imageIndex]}`;
      //         const fileRef = ref(storage, imagePathS);
      //         const downloadUrl = await getDownloadURL(fileRef);
      //         downloadFile(imagePath, downloadUrl);
      //       }
      //     } else {
      //       makeDirectory(`tabs/${tabNames[tabIndex]}/images`);
      //     }

      //     if (videosNames.length > 0) {
      //       for (
      //         let videoIndex = 0;
      //         videoIndex < videosNames.length;
      //         videoIndex++
      //       ) {
      //         let videoPath = `tabs/${tabNames[tabIndex]}/videos/${videosNames[videoIndex]}`;
      //         let videoPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/videos/${videosNames[videoIndex]}`;
      //         const fileRef = ref(storage, videoPathS);
      //         const downloadUrl = await getDownloadURL(fileRef);
      //         downloadFile(videoPath, downloadUrl);
      //       }
      //     } else {
      //       makeDirectory(`tabs/${tabNames[tabIndex]}/videos`);
      //     }

      //     if (documentsNames.length > 0) {
      //       for (
      //         let documentIndex = 0;
      //         documentIndex < documentsNames.length;
      //         documentIndex++
      //       ) {
      //         let documentPath = `tabs/${tabNames[tabIndex]}/documents/${documentsNames[documentIndex]}`;
      //         let documentPathS = `${BASEURL_TABS}/${tabNames[tabIndex]}/documents/${documentsNames[documentIndex]}`;
      //         const fileRef = ref(storage, documentPathS);
      //         const downloadUrl = await getDownloadURL(fileRef);
      //         downloadFile(documentPath, downloadUrl);
      //       }
      //     } else {
      //       makeDirectory(`tabs/${tabNames[tabIndex]}/documents`);
      //     }
      //   }

      const tabs = await listSubdirectories("tabs");
      for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
        let imagesPath = `tabs/tab1/images`;
        let videosPath = `tabs/tab1/videos`;
        let documentsPath = `tabs/tab1/documents`;
        listFiles(imagesPath);
        listFiles(videosPath);
        listFiles(documentsPath);
      }
    }
    callFunctions();
  }, []);
  async function makeDirectory(path) {
    const dirUri = FileSystem.documentDirectory + path;
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
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

  const listFiles = async (path) => {
    try {
      const fullDirUri = FileSystem.documentDirectory + path;
      const items = await FileSystem.readDirectoryAsync(fullDirUri);
      const files = [];

      for (const item of items) {
        const itemUri = `${fullDirUri}/${item}`;
        const info = await FileSystem.getInfoAsync(itemUri);
        if (!info.isDirectory) {
          files.push(item);
        }
      }

      console.log("Files:", files);
      return files;
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  };
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

  const downloadFile = async (path, fileUrl) => {
    try {
      const dirUri =
        FileSystem.documentDirectory + path.substring(0, path.lastIndexOf("/"));
      await ensureDirExists(dirUri); // Ensure the directory exists

      const fileUri = FileSystem.documentDirectory + path;
      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
      console.log("File downloaded to:", downloadResult.uri);
      return downloadResult.uri;
    } catch (error) {
      console.error("Error downloading file:", error);
      return null;
    }
  };

  const openFile = async (path) => {
    try {
      const uri = FileSystem.documentDirectory + path;
      const canOpen = await Linking.canOpenURL(uri);
      if (canOpen) {
        Linking.openURL(uri);
      } else {
        console.log("Cannot open file:", uri);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  return (
    <Image
      source={{
        uri: "file:///data/user/0/host.exp.exponent/files/folderName/test",
      }}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
