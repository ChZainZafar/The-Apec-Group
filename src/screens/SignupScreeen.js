import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Logo from "../components/Logo";
import TextInput from "../components/TextInput";
import { useState } from "react";
import Sepreator from "../components/Seperator";
import Heading from "../components/Heading";
import Button from "../components/Button";
import { theme } from "../infrastructure/theme";
import { addUser, getUser } from "../config/firebase";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import Toast from "react-native-toast-message";
import { showToast } from "../utils/commonFunctions.js";
export default function SignupScreen({ navigation, route }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { usertype, isAdmin } = route.params;

  const onSignupPress = async () => {
    if (username && email && password && phoneNo) {
      setIsLoading(true);
      try {
        const user = await getUser(username);

        if (user.data() == null) {
          await addUser(
            {
              email: email,
              username: username,
              password: password,
              phoneNo: phoneNo,
              usertype: usertype,
              isApproved: isAdmin,
            },
            firestoreCollections.USER_COLLECTION
          );
          showToast("success", "Signed up successfully");
          setIsLoading(false);
        } else {
          setIsLoading(false);
          showToast("error", "Oops!", "This username is already taken");
        }
      } catch (e) {
        setIsLoading(false);
        console.log(e.message);
      }
    } else {
      console.log("Add all info");
    }
  };

  return (
    <>
      <Toast />
      <View style={{ flex: 0.33 }}>
        <Logo height={"100%"} width={"100%"} />
      </View>
      <Sepreator />
      <View
        style={{
          flex: 0.6,
          width: "100%",
          justifyContent: "center",
          paddingHorizontal: "5%",
        }}
      >
        <View
          style={{
            flex: 0.6,
            width: "100%",
            justifyContent: "center",
            paddingHorizontal: "5%",
          }}
        >
          <Heading title={"Sign up"} />
        </View>
        <TextInput label="Email" value={email} setValue={setEmail} />
        <TextInput label="Phone No." value={phoneNo} setValue={setPhoneNo} />
        <TextInput label="Username" value={username} setValue={setUsername} />
        <TextInput label="Password" value={password} setValue={setPassword} />
        <View style={{ width: "100%", alignItems: "center" }}>
          <Button
            title={isAdmin ? `Add a ${usertype}` : "Sign up"}
            onPress={() => {
              onSignupPress();
            }}
            loading={isLoading}
          />
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("SigninScreen", {
                usertype: usertype,
                isAdmin: isAdmin,
              });
            }}
          >
            <Text style={{ color: theme.colors.brand.primary }}>
              Already have an account? Sign in instead
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
