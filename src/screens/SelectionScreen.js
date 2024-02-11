import { Text, View } from "react-native";
import Sepreator from "../components/Seperator";
import Logo from "../components/Logo";
import Button from "../components/Button";

export default function SelectionScreen({ navigation }) {
  return (
    <>
      <View style={{ flex: 0.35, width: "100%" }}>
        <Logo height={"100%"} width={"100%"} />
      </View>
      <Sepreator />
      <View
        style={{
          flex: 0.65,
          width: "100%",
          paddingHorizontal: 10,
          justifyContent: "center",
        }}
      >
        <Button
          title={"Admin"}
          onPress={() => {
            navigation.navigate("SigninScreen", {
              usertype: "admin",
              isAdmin: false,
            });
          }}
        />
        <Button
          title={"Employee"}
          onPress={() => {
            navigation.navigate("SigninScreen", {
              usertype: "employee",
              isAdmin: false,
            });
          }}
        />
      </View>
    </>
  );
}
