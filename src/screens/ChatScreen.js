import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { getCurrentUser, getTable, getUser } from "../config/firebase";
import Icon from "react-native-vector-icons/MaterialIcons";
import { sendMessage, recieveMessage } from "../config/firebase";
import { onValue } from "firebase/database";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { UserContext } from "../context/UserContext.js";
import { theme } from "../infrastructure/theme/index.js";

export default function ChatScreen({ navigation, route }) {
  const [message, setMessage] = useState("");
  const [currentUid, setCurrentUid] = useState("");
  //   const [guestUid, setGuestUid] = useState("");
  const [allMessages, setAllMessages] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const { guestName } = route.params;
  const { user, usertype } = useContext(UserContext);
  //   useEffect(() => {
  //     const user = getCurrentUser();
  //     setCurrentUid(user.uid);
  //

  //     setGuestUid(guestUid);
  //   }, []);
  // console.log("guestId", guestUid);
  useEffect(() => {
    async function getMessages() {
      if (user && guestName) {
        const messages = await getTable(
          `insectorsMessages/${user.username}/${guestName}`
        );
        onValue(messages, (snapshot) => {
          const data = [];
          snapshot.forEach((message) => {
            data.push({
              sendBy: message.val().sender,
              recieveBy: message.val().reciever,
              message: message.val().message,
            });
          });
          //   console.log("data", data);
          setAllMessages(data.reverse());
        });
      }
    }
    getMessages();
  }, [user.username, guestName]);

  useEffect(() => {
    async function setCurrentUserData() {
      const docSnap = await getUser(currentUid, Constants.USERS_COLLECTION);
      if (docSnap.exists()) {
        setCurrentUserInfo(docSnap.data());
        // console.log(profilePhoto);
      } else {
        // console.log("No such document line 247!");
      }
    }
    if (currentUid) {
      setCurrentUserData();
    }
  }, [currentUid]);
  async function sendOneMessage() {
    if (message) {
      try {
        await sendMessage(currentUid, guestUid, message);
        setMessage("");
        // console.log("sended");
        await recieveMessage(currentUid, guestUid, message);
        setMessage("");
      } catch (e) {
        console.log("e", e);
      }
    }
  }

  console.log("currentUserInfo", currentUserInfo);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        inverted
        style={{ marginBottom: 60 }}
        data={allMessages}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <View
            style={{
              marginVertical: 10,
              maxWidth: Dimensions.get("window").width / 2 + 10,
              alignSelf: currentUid == item.sendBy ? "flex-end" : "flex-start",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                borderRadius: 20,
                backgroundColor:
                  currentUid == item.sendBy ? "#c8f2ac" : "#d1d4cf",
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontWeight: "500" }}>
                {currentUserInfo && currentUid == item.sendBy
                  ? currentUserInfo.username
                  : guestName}
              </Text>
              <Text style={{ padding: 6, fontSize: 16 }}>{item.message}</Text>
            </View>
          </View>
        )}
      />
      {usertype == "admin" && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            // height: 55,
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: theme.colors.brand.primary,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
        >
          <TextInput
            placeholder="Enter message"
            style={{ height: 40, width: "70%" }}
            value={message}
            onChangeText={(message) => setMessage(message)}
            width="90%"
            backgroundColor="white"
            borderRadius={10}
            paddingHorizontal={6}
          />
          <Icon
            name="send"
            size={25}
            color="white"
            onPress={() => {
              sendOneMessage();
            }}
            alignSelf="center"
            marginLeft={4}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profileImageContainer: {
    // marginLeft: 8,
    height: 40,
    width: 40,
    borderRadius: 50,
    overflow: "hidden",
    alignSelf: "flex-start",
    marginRight: 4,
  },
});
