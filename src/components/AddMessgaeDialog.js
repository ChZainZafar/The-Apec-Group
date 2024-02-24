import { ActivityIndicator, Dialog, RadioButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../infrastructure/theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import { showToast } from "../utils/commonFunctions";
import {
  addDocument,
  updateArrays,
  updateDocument,
  uploadImage,
} from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { getDownloadURL } from "firebase/storage";
import TextInput from "./TextInput.js";
import Sepreator from "./Seperator.js";
import { serverTimestamp } from "@firebase/firestore";

export default function AddMessageDialog({ visible, onDismiss, callback }) {
  const [messgae, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [checked, setChecked] = useState("Text");
  const [usertype, setUsertype] = useState("Customer");
  const [loading, setLoading] = useState(false);
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 0.2,
        allowsMultipleSelection: false,
      });

      setImage(result.assets[0].uri);
    } catch (e) {
      console.log(e);
    }
  };

  async function onAdd() {
    console.log("adding");
    if (checked != "Text") {
      try {
        setLoading(true);
        const snapshot = await uploadImage(
          `TheApecGroup_messages/${new Date().getMilliseconds()}`,
          image
        );

        let downloadUrl = await getDownloadURL(snapshot.ref);
        await addDocument(
          {
            text: checked != "Image" ? messgae : "",
            image: downloadUrl,
            messageType: checked,
            usertype: usertype,
            createdAt: serverTimestamp(),
          },
          firestoreCollections.MESSAGES_COLLECTION
        );

        setLoading(false);
        console.log("added");

        showToast("success", "Image added!");
        callback();
        onDismiss();
      } catch (e) {
        setLoading(false);
        console.log(e.message);
        showToast("error", `${e.message}`);
      }
    } else {
      await addDocument(
        {
          text: messgae,
          image: "",
          messageType: checked,
          usertype: usertype,
          createdAt: serverTimestamp(),
        },
        firestoreCollections.MESSAGES_COLLECTION
      );
      // showToast("error", "Please select an image");
      // console.log("noImage");
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
      <Dialog.Title>Add a Message</Dialog.Title>
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
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>Text</Text>
            <RadioButton
              value="Text"
              status={checked === "Text" ? "checked" : "unchecked"}
              onPress={() => setChecked("Text")}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>Image</Text>
            <RadioButton
              value="Image"
              status={checked === "Image" ? "checked" : "unchecked"}
              onPress={() => setChecked("Image")}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>Both</Text>
            <RadioButton
              value="Both"
              status={checked === "Both" ? "checked" : "unchecked"}
              onPress={() => setChecked("Both")}
            />
          </View>
        </View>
        <Sepreator />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            flexWrap: "wrap",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>Customer</Text>
            <RadioButton
              value="Customer"
              status={usertype === "Customer" ? "checked" : "unchecked"}
              onPress={() => setUsertype("Customer")}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>Employee</Text>
            <RadioButton
              value="Employee"
              status={usertype === "Employee" ? "checked" : "unchecked"}
              onPress={() => setUsertype("Employee")}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>Both</Text>
            <RadioButton
              value="Both"
              status={usertype === "Both" ? "checked" : "unchecked"}
              onPress={() => setUsertype("Both")}
            />
          </View>
        </View>
        <Sepreator />
        {checked != "Image" && (
          <TextInput label={"Message"} value={messgae} setValue={setMessage} />
        )}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.ui.quaternary,
          }}
          onPress={pickImage}
          disabled={loading}
        >
          {checked != "Text" ? (
            image ? (
              <Image
                source={{ uri: image }}
                style={{
                  height: "53%",
                  width: "100%",
                  alignSelf: "center",
                }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require("../../assets/placeholder.png")}
                style={{
                  height: "53%",
                  width: "100%",
                  alignSelf: "center",
                }}
                resizeMode="contain"
              />
            )
          ) : null}
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
