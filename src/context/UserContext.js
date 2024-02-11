// UserContext.js
import React, { createContext, useState } from "react";

export const UserContext = createContext({
  userType: null, // Admin status
  setUsertype: () => {}, // Function to update the admin status
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [usertype, setUsertype] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ usertype, setUsertype, user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
