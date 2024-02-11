import { Dialog } from "react-native-paper";
import { theme } from "../infrastructure/theme";
import { StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import { updateDocument } from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { showToast } from "../utils/commonFunctions";
import { useState } from "react";
export default function UserDialog({ user, visible, onDismiss }) {
  const [loading, setLoading] = useState(false);

  async function ApproveUser() {
    try {
      setLoading(true);
      await updateDocument(
        firestoreCollections.USER_COLLECTION,
        user.username,
        {
          isApproved: true,
        }
      );
      setLoading(false);

      showToast("success", `${user.username} has been approved`);
      onDismiss();
    } catch (e) {
      setLoading(false);

      showToast("error", `${e.message}`);
    }
  }
  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      style={{
        backgroundColor: theme.colors.ui.quaternary,
      }}
    >
      <Dialog.Title>{user ? user.username : null}</Dialog.Title>
      <Dialog.Content>
        <View>
          <View style={styles.propertyContainer}>
            <Text style={styles.property}>Name:</Text>
            <Text>{user ? user.username : null}</Text>
          </View>
          <View style={styles.propertyContainer}>
            <Text style={styles.property}>E-mail:</Text>
            <Text>{user ? user.email : null}</Text>
          </View>
          <View style={styles.propertyContainer}>
            <Text style={styles.property}>Phone number:</Text>
            <Text>{user ? user.phoneNo : null}</Text>
          </View>
          <View style={styles.propertyContainer}>
            <Text style={styles.property}>User type:</Text>
            <Text>{user ? user.usertype : null}</Text>
          </View>
          {user && user.isApproved == false && (
            <Button
              title={"Approve User"}
              onPress={ApproveUser}
              loading={loading}
            />
          )}
        </View>
      </Dialog.Content>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  propertyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  property: {
    fontWeight: "bold",
  },
});
