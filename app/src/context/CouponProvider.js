import React, { useState } from 'react';

const CouponContext = React.createContext();

const CouponProvider = (props) => {
  const [couponsList, setCouponsList] = useState([]);
  const [couponAmount, setCouponAmount] = useState(0);

  return (
    <CouponContext.Provider
      value={{
        couponsList,
        setCouponsList,
        couponAmount,
        setCouponAmount,
      }}>
      {props.children}
    </CouponContext.Provider>
  );
};

export { CouponProvider, CouponContext };
