import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Sepreator from "../components/Seperator";
import { getAllDocuments } from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import UserDialog from "../components/UserDialog.js";
import Toast from "react-native-toast-message";
import { CheckBox } from "react-native-elements";
import { getRadioButtonStyleProps } from "../utils/commonFunctions.js";

export default function UsersListScreen() {
  const [checked, setChecked] = useState("All");
  const [users, setUsers] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDialogVisible, setIsUserDIalogVisible] = useState(false);

  async function getUsers() {
    const unsubscribe = await getAllDocuments(
      firestoreCollections.USER_COLLECTION,
      setUsers
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = () => {
    if (!users) return [];

    if (checked === "All") {
      // Add condition of user.isApproved
      return users.filter(
        (user) => user && user.usertype !== "admin" && user.isApproved
      );
    } else if (checked === "Pending") {
      return users.filter(
        (user) =>
          user &&
          user.usertype !== "admin" &&
          user.isApproved !== undefined &&
          !user.isApproved
      );
    }
  };
  return (
    <View style={{ flex: 1, paddingHorizontal: "8%" }}>
      <Toast />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 4,
          }}
        >
          <CheckBox
            title="All"
            checked={checked === "All"}
            onPress={() => setChecked("All")}
            {...getRadioButtonStyleProps()}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 4,
          }}
        >
          <CheckBox
            title="Pending"
            checked={checked === "Pending"}
            onPress={() => setChecked("Pending")}
            {...getRadioButtonStyleProps()}
          />
        </View>
      </View>
      <Sepreator />
      <FlatList
        data={filteredUsers()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              paddingVertical: "6%",
              paddingHorizontal: "0%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: "gray",
            }}
            onPress={() => {
              setSelectedUser(item);
              setIsUserDIalogVisible(true);
            }}
          >
            <Text>{item.username}</Text>
            <Text>{item.usertype}</Text>
          </TouchableOpacity>
        )}
      />
      <UserDialog
        user={selectedUser}
        visible={isUserDialogVisible}
        onDismiss={() => {
          setIsUserDIalogVisible(false);
          getUsers();
        }}
      />
    </View>
  );
}
