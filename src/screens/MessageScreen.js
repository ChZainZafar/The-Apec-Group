import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { theme } from "../infrastructure/theme";
import AddMessageDialog from "../components/AddMessgaeDialog";
import { getAllDocuments } from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import { UserContext } from "../context/UserContext";
import { ActivityIndicator } from "react-native-paper";

export default function MessageScreen() {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  // Initialize messages as an empty array
  const [messages, setMessages] = useState([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const { usertype } = useContext(UserContext);
  const scrollViewRef = useRef();
  const fetchMessages = async () => {
    try {
      // Assuming getAllDocuments is correctly implemented to eventually call setMessages
      setIsMessageLoading(true);
      const unsubscribe = await getAllDocuments(
        firestoreCollections.MESSAGES_COLLECTION,
        (fetchedMessages) => {
          // Ensure fetchedMessages is an array before setting state
          if (Array.isArray(fetchedMessages)) {
            setMessages(fetchedMessages);
            setIsMessageLoading(false);
          } else {
            console.error("fetchedMessages is not an array:", fetchedMessages);
            setIsMessageLoading(false);
          }
        }
      );
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sortedAndFilteredMessages = messages
    .slice()
    .sort((a, b) => {
      const aTime =
        a.createdAt && a.createdAt.toDate()
          ? a.createdAt.toDate().getTime()
          : 0;
      const bTime =
        b.createdAt && b.createdAt.toDate()
          ? b.createdAt.toDate().getTime()
          : 0;
      return aTime - bTime;
    })
    .filter((msg) => {
      return (
        usertype === "admin" ||
        msg.usertype == "Both" ||
        msg.usertype === usertype
      );
    });
  const renderMessageContent = (message) => {
    switch (message.messageType) {
      case "Text":
        return <Text style={styles.messageText}>{message.text}</Text>;
      case "Image":
        return (
          <Image source={{ uri: message.image }} style={styles.messageImage} />
        );
      case "Both":
        return (
          <>
            <Image
              source={{ uri: message.image }}
              style={styles.messageImage}
            />
            <Text style={styles.messageText}>{message.text}</Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isMessageLoading ? (
        <View
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator
            size={"large"}
            color={theme.colors.brand.primary}
            style={{ zIndex: 3000 }}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
          onLayout={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {sortedAndFilteredMessages.map((message, index) => (
            <View key={index} style={styles.messageContainer}>
              {renderMessageContent(message)}
            </View>
          ))}
        </ScrollView>
      )}

      {usertype == "admin" && (
        <Icon
          name="add-circle"
          color={theme.colors.brand.primary}
          size={40}
          style={styles.addButton}
          onPress={() => {
            setIsMessageDialogOpen(true);
          }}
        />
      )}

      <AddMessageDialog
        visible={isMessageDialogOpen}
        onDismiss={() => {
          setIsMessageDialogOpen(false);
        }}
        callback={fetchMessages}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: "#dbdbd9",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageImage: {
    width: "90%",
    height: 250,
    resizeMode: "cover",
    marginVertical: 5,
    alignSelf: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});
