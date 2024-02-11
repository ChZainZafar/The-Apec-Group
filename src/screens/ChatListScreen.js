import { onValue } from "firebase/database";
import { useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableHighlight,
  View,
} from "react-native";
import { getCurrentUser, getTable, getUser } from "../config/firebase";
import { useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Constants from "../constants.js";
import { TouchableOpacity } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function ChatListScreen({ navigation }) {
  const [usersData, setUsersData] = useState(null);

  //   console.log("usersData", usersData);

  const user = getCurrentUser();
  useEffect(() => {
    async function getMessages() {
      if (user.uid) {
        const messages = await getTable(`insectorsMessages/${user.uid}`);
        onValue(messages, async (snapshot) => {
          const data = [];
          const keys = Object.keys(snapshot.toJSON());

          for (const item of keys) {
            const docSnap = await getUser(item, Constants.USERS_COLLECTION);
            if (docSnap.exists()) {
              data.push(docSnap.data());
            } else {
              console.log("No such document!");
            }
          }

          setUsersData(data);
        });
      }
    }
    getMessages();
  }, [user]);
  // console.log("user.profilep", user.username);
  return (
    <ScrollView style={styles.container}>
      <View>
        {usersData && usersData.length > 0 ? (
          usersData.map((user, index) => {
            {
              console.log("username", user.profilePhoto);
            }
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ChatScreen", {
                    guestUid: user.userId,
                    guestName: user.username,
                    guestProfilePic: user.profilePhoto,
                  });
                }}
              >
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <TouchableHighlight style={[styles.profileImgContainer]}>
                    <Image
                      source={{ uri: user.profilePhoto }}
                      style={{
                        height: 60,
                        width: 60,
                        marginRight: 6,
                        borderRadius: 50,
                      }}
                    />
                  </TouchableHighlight>
                  <View
                    style={{
                      backgroundColor: Constants.LIGHT_GRAY,
                      borderRadius: 10,
                      width: "80%",
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderWidth:
                        user.email == "aqeelzafar195@gmail.com" ? 2 : 0,

                      borderColor: Constants.THEME_COLOR,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 6,
                      }}
                    >
                      {user.username}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : usersData == null ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator
              animating={true}
              color={Constants.THEME_COLOR}
              size="large"
            />
          </View>
        ) : (
          <Text>
            <View style={{ alignSelf: "center" }}>
              <Icon
                name="hourglass-empty"
                size={100}
                color={Constants.THEME_COLOR}
                style={{ alignSelf: "center" }}
              />
              <Text style={{ fontSize: 35, fontWeight: "bold" }}>No Chat</Text>
            </View>
          </Text>
        )}
        {}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    // justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 50,
  },
  profileImgContainer: {
    // marginLeft: 8,
    height: 60,
    width: 60,
    borderRadius: 50,
    overflow: "hidden",
    alignSelf: "center",
  },
});
