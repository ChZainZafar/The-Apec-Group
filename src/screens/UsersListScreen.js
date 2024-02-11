import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { RadioButton } from "react-native-paper";
import Sepreator from "../components/Seperator";
import { getAllDocuments, getUser } from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import UserDialog from "../components/UserDialog.js";
import Toast from "react-native-toast-message";

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
      return users.filter((user) => user && user.usertype !== "admin");
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
          <Text style={{ fontSize: 16 }}>All</Text>
          <RadioButton
            value="All"
            status={checked === "All" ? "checked" : "unchecked"}
            onPress={() => setChecked("All")}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 4,
          }}
        >
          <Text style={{ fontSize: 16 }}>Pending</Text>
          <RadioButton
            value="Pending"
            status={checked === "Pending" ? "checked" : "unchecked"}
            onPress={() => setChecked("Pending")}
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
