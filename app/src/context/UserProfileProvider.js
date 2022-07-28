import React, { useState } from "react";

const UserProfileContext = React.createContext();

const UserProfileProvider = (props) => {
  const [isStoredContext, setIsStoredContext] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [tempData, setTempData] = useState([]);

  return (
    <UserProfileContext.Provider
      value={{
        tempData,
        setTempData,
        showMoreAbout,
        setShowMoreAbout,
        isStoredContext,
        setIsStoredContext
      }}
    >
      {props.children}
    </UserProfileContext.Provider>
  );
};

export { UserProfileProvider, UserProfileContext };
