import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StartScreen from "./src/screens/StartScreen";
import { NavigationContainer } from "@react-navigation/native";
import SigninScreen from "./src/screens/SigninScreen";
import { ThemeProvider } from "styled-components/native";
import { theme } from "./src/infrastructure/theme";
import {
  useFonts as useOswold,
  Oswald_400Regular,
} from "@expo-google-fonts/oswald";
import { useFonts as useLato, Lato_400Regular } from "@expo-google-fonts/lato";
import SignupScreen from "./src/screens/SignupScreeen.js";
import SelectionScreen from "./src/screens/SelectionScreen.js";
import HomeScreen from "./src/screens/HomeScreen.js";
import { UserContext, UserProvider } from "./src/context/UserContext.js";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "./src/screens/ProfileScreen.js";
import { useContext } from "react";
import UsersListScreen from "./src/screens/UsersListScreen.js";
import FolderContentScreen from "./src/screens/FolderContentScreen.js";
import FullScreen from "./src/screens/FullScreen.js";
import TestScreen from "./src/screens/TestScreen.js";
import PdfOpenerScreen from "./src/screens/PdfOpenerScreen.js";
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
function App() {
  let [oswaldLoaded] = useOswold({
    Oswald_400Regular,
  });
  let [latoLoaded] = useLato({
    Lato_400Regular,
  });

  if (!oswaldLoaded || !latoLoaded) {
    return null;
  }

  function HomeScreens() {
    const { usertype } = useContext(UserContext);

    return (
      <Drawer.Navigator
        screenOptions={{
          drawerActiveBackgroundColor: theme.colors.brand.primary,

          headerStyle: {
            backgroundColor: theme.colors.brand.primary,
          },
          headerTintColor: "white",
          headerTitle: "The Apec Group",
          drawerActiveTintColor: "white",
        }}
      >
        <Drawer.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
        {usertype != "admin" && (
          <Drawer.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
        )}

        {usertype == "admin" && (
          <Drawer.Screen
            name="UsersListScreen"
            component={UsersListScreen}
            options={{ title: "Users List" }}
          />
        )}
        {usertype == "admin" && (
          <Drawer.Screen
            name="AddCustomerScreen"
            component={SignupScreen}
            initialParams={{
              usertype: "customer",
              isAdmin: true,
            }}
            options={{ title: "Add a customer" }}
          />
        )}
        {usertype == "admin" && (
          <Drawer.Screen
            name="AddEmployeeScreen"
            component={SignupScreen}
            initialParams={{
              usertype: "employee",
              isAdmin: true,
            }}
            options={{ title: "Add a employee" }}
          />
        )}
      </Drawer.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.brand.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitle: "The Apec Group",
      }}
    >
      {/* <Stack.Screen name="TestScreen" component={TestScreen} /> */}
      <Stack.Screen name="StackSceen" component={StartScreen} />
      <Stack.Screen name="SigninScreen" component={SigninScreen} />
      <Stack.Screen name="SignupScreeen" component={SignupScreen} />
      <Stack.Screen name="SelectionScreen" component={SelectionScreen} />
      <Stack.Screen name="FullScreen" component={FullScreen} />
      {/* <Stack.Screen name="PdfOpenerScreen" component={PdfOpenerScreen} /> */}

      <Stack.Screen
        name="FolderContentScreen"
        component={FolderContentScreen}
      />

      <Stack.Screen
        name="HomeScreens"
        component={HomeScreens}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default () => {
  return (
    // <UserProvider>
    <UserProvider>
      <NavigationContainer independent={true}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </NavigationContainer>
    </UserProvider>
  );
};
