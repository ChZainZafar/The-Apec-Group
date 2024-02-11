// UserContext.js
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext({
  userType: null, // Admin status
  setUsertype: () => {}, // Function to update the admin status
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [usertype, setUsertype] = useState(false);
  const [user, setUser] = useState();

  const loadUser = async () => {
    let _user = await AsyncStorage.getItem("USER");
    if (_user) {
      _user = JSON.parse(_user);
      setUser(_user);
      if (_user.usertype) setUsertype(_user.usertype);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    (async () => {
      if (user) await AsyncStorage.setItem("USER", JSON.stringify(user));
    })();
  }, [user]);

  return (
    <UserContext.Provider value={{ usertype, setUsertype, user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
