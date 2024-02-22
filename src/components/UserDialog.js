import { Dialog } from "react-native-paper";
import { theme } from "../infrastructure/theme";
import { StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import { updateDocument } from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { sendEmail, showToast } from "../utils/commonFunctions";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext.js";
export default function UserDialog({ user, visible, onDismiss }) {
  const [loading, setLoading] = useState(false);
  console.log("user.email", user.email);
  async function ApproveUser() {
    try {
      setLoading(true);
      const email_payload = {
        from_name: "The APEC Group",
        from_email: "contact@thapecgroup.com",
        to: user.email,
        html_body: `<body style='font-family:Arial,sans-serif;background-color:#f4f4f4;padding:20px'><table style='max-width:600px;margin:0 auto;background-color:#fff;padding:20px;border-radius:10px'><tr><td style='text-align:center'><img src='https://i.ibb.co/QJczwx6/Logo.jpg' alt='The ACE Group Logo' style='max-width:150px'></td></tr><tr><td style='padding:20px'><h2 style='color:#333'>Congratulations!</h2><p style='color:#333;font-size:16px;line-height:1.6'>Dear ${user.username},</p><p style='color:#333;font-size:16px;line-height:1.6'>We are thrilled to inform you that your application has been approved at The ACE Group. Your hard work and dedication have paid off, and we are excited to welcome you to our team.</p><p style='color:#333;font-size:16px;line-height:1.6'>We believe that you will make valuable contributions to our company, and we look forward to working together towards shared success.</p><p style='color:#333;font-size:16px;line-height:1.6'>Once again, congratulations on this achievement!</p><p style='color:#333;font-size:16px;line-height:1.6'>Best regards,<br>The ACE Group Team</p></td></tr></table></body>`,
        subject: "Invitation",
      };
      await updateDocument(
        firestoreCollections.USER_COLLECTION,
        user.username,
        {
          isApproved: true,
        }
      );
      sendEmail(email_payload);
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
