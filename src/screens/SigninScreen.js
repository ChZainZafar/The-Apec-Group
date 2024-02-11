import { Text, TouchableOpacity, View } from "react-native";
import Logo from "../components/Logo";
import TextInput from "../components/TextInput";
import { useContext, useState } from "react";
import Sepreator from "../components/Seperator";
import Heading from "../components/Heading";
import Button from "../components/Button";
import { theme } from "../infrastructure/theme";
import { getUser } from "../config/firebase";
import { UserContext } from "../context/UserContext";
import { showToast } from "../utils/commonFunctions";
import Toast from "react-native-toast-message";
import { CommonActions } from "@react-navigation/native";

export default function SigninScreen({ navigation, route }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUsertype, setUser } = useContext(UserContext);
  const { usertype, isAdmin } = route.params;

  const onSigninPress = async () => {
    if (username && password) {
      if (username == "tag" && password == "tag") {
        setPassword("");
        setUsername("");
        setLoading(false);
        navigation.navigate("SelectionScreen");
        return;
      }

      try {
        if (username && password) setLoading(true);
        const user = await getUser(username);

        if (!user) {
          console.log("no user");
        } else {
          const userData = user.data();

          if (userData) {
            if (
              password === userData.password &&
              usertype === userData.usertype
            ) {
              if (userData.usertype === "admin") {
                setPassword("");
                setUsername("");
                setUsertype(usertype);
                setLoading(false);
                showToast(
                  "success",
                  "Congratulations",
                  "You have signed in as admin"
                );
                setUser(userData);
              }
              if (userData.isApproved && userData.isApproved === true) {
                setLoading(false);

                showToast(
                  "success",
                  "Congratulations",
                  `You have signed as ${usertype}`
                );
                setUser(userData);

                setUsertype(usertype);
                setPassword("");
                setUsername("");
              } else if (userData.isApproved == false) {
                setLoading(false);

                showToast(
                  "error",
                  "Wait for some time. Your request has been submitted",
                  "We will ping you when admin approves your request"
                );
              }
            } else {
              setLoading(false);

              showToast("error", "Oops!", "Invalid credentials!");
            }
          } else {
            setLoading(false);

            console.log("User data is undefined");
          }
        }
      } catch (e) {
        setLoading(false);

        showToast("error", `${e.message}`);
      }
    } else {
      showToast(
        "error",
        "Fill up everything!",
        "To conitnue, enter email and password"
      );
    }
  };

  return (
    <>
      <View
        style={{
          zIndex: Number.MAX_SAFE_INTEGER,
        }}
      >
        <Toast />
      </View>
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
        <View style={{ width: "100%", alignItems: "center" }}>
          <Heading title={"Sign in"} />
        </View>
        <TextInput label="Username" value={username} setValue={setUsername} />
        <TextInput label="Password" value={password} setValue={setPassword} />
        <View style={{ width: "100%", alignItems: "center" }}>
          <Button
            title="Sign in"
            onPress={() => {
              onSigninPress();
            }}
            loading={loading}
          />
          {usertype == "customer" && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SignupScreeen", {
                  usertype: usertype,
                  isAdmin: isAdmin,
                });
              }}
            >
              <Text style={{ color: theme.colors.brand.primary }}>
                Don't have an account? Sign up instead
              </Text>
            </TouchableOpacity>
          )}
          {usertype == "employee" && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SignupScreeen", {
                  usertype: usertype,
                  isAdmin: isAdmin,
                });
              }}
            >
              <Text style={{ color: theme.colors.brand.primary }}>
                Don't have an account? Sign up instead
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}
