import React, { useState } from 'react';

const PremiumServiceContext = React.createContext();

const PremiumServiceProvider = (props) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);

  return (
    <PremiumServiceContext.Provider
      value={{
        tabIndex,
        setTabIndex,
        categories,
        setCategories,
        selectedCategories,
        setSelectedCategories,
      }}>
      {props.children}
    </PremiumServiceContext.Provider>
  );
};

export { PremiumServiceProvider, PremiumServiceContext };
