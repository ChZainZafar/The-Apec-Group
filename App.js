import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StartScreen from "./src/screens/StartScreen";
import { NavigationContainer } from "@react-navigation/native";
import SigninScreen from "./src/screens/SigninScreen";
import { ThemeProvider } from "styled-components/native";
import { theme } from "./src/infrastructure/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts as useOswold,
  Oswald_400Regular,
} from "@expo-google-fonts/oswald";
import { useFonts as useLato, Lato_400Regular } from "@expo-google-fonts/lato";
import SignupScreen from "./src/screens/SignupScreeen.js";
import SelectionScreen from "./src/screens/SelectionScreen.js";
import HomeScreen from "./src/screens/HomeScreen.js";
import { UserContext, UserProvider } from "./src/context/UserContext.js";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import ProfileScreen from "./src/screens/ProfileScreen.js";
import { useContext, useEffect } from "react";
import UsersListScreen from "./src/screens/UsersListScreen.js";
import FolderContentScreen from "./src/screens/FolderContentScreen.js";
import FullScreen from "./src/screens/FullScreen.js";
import TestScreen from "./src/screens/TestScreen.js";
import PdfOpenerScreen from "./src/screens/PdfOpenerScreen.js";
import { StatusBar } from "expo-status-bar";
import { Button } from "react-native-paper";
import { colors } from "./src/infrastructure/theme/colors.js";
import MessageScreen from "./src/screens/MessageScreen.js";
import * as Device from "expo-device";
import * as ScreenOrientation from "expo-screen-orientation";
import VideoPlayerScreen from "./src/screens/VideoPlayerScreen.js";
async function changeScreenOrientation() {
  const isTablet = await Device.isTabletAsync();
  if (isTablet) {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  } else {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT
    );
  }
}
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
function App() {
  useEffect(() => {
    changeScreenOrientation();
  }, []);
  const { usertype, user, setUser } = useContext(UserContext);
  let [oswaldLoaded] = useOswold({
    Oswald_400Regular,
  });
  let [latoLoaded] = useLato({
    Lato_400Regular,
  });

  if (!oswaldLoaded || !latoLoaded) {
    return null;
  }
  const CustomDrawerContent = (props) => {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <Button
          onPress={async () => {
            setUser();
            await AsyncStorage.removeItem("USER");
          }}
          textColor={colors.brand.primary}
        >
          Log Out
        </Button>
      </DrawerContentScrollView>
    );
  };
  function HomeScreens() {
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
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="StartScreen"
          component={StartScreen}
          options={{ title: "Start" }}
          initialParams={{ isStart: false }}
        />
        <Drawer.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
        {/* <Drawer.Screen name="PdfOpenerScreen" component={PdfOpenerScreen} /> */}
        {/* {usertype != "admin" && (
          <Drawer.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
        )} */}
        <Drawer.Screen
          name="MessageScreen"
          component={MessageScreen}
          options={{ title: "Messages" }}
        />
        {usertype == "admin" && (
          <>
            <Drawer.Screen
              name="UsersListScreen"
              component={UsersListScreen}
              options={{ title: "Users List" }}
            />
            <Drawer.Screen
              name="AddCustomerScreen"
              component={SignupScreen}
              initialParams={{
                usertype: "customer",
                isAdmin: true,
              }}
              options={{ title: "Add a customer" }}
            />
            <Drawer.Screen
              name="AddEmployeeScreen"
              component={SignupScreen}
              initialParams={{
                usertype: "employee",
                isAdmin: true,
              }}
              options={{ title: "Add a employee" }}
            />
          </>
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
        headerBackTitle: "Back",
      }}
    >
      {!user?.username ? (
        <>
          <Stack.Screen
            name="StackSceen"
            component={StartScreen}
            initialParams={{ isStart: true }}
          />
          <Stack.Screen name="SigninScreen" component={SigninScreen} />
          <Stack.Screen name="SignupScreeen" component={SignupScreen} />
          <Stack.Screen name="SelectionScreen" component={SelectionScreen} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="HomeScreens"
            component={HomeScreens}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FolderContentScreen"
            component={FolderContentScreen}
          />
          <Stack.Screen name="FullScreen" component={FullScreen} />
          <Stack.Screen
            name="VideoPlayerScreen"
            component={VideoPlayerScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default () => {
  return (
    <>
      <StatusBar style="light" />
      <UserProvider>
        <NavigationContainer independent={true}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </NavigationContainer>
      </UserProvider>
    </>
  );
};
