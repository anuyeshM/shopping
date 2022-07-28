import React, { useState, useEffect } from "react";
import AppContext from "../commons/context";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createMuiTheme } from "@material-ui/core";
import { Provider as FlightProvider } from "./FlightsContext";
import { Provider as DeliveryProvider } from "./DeliveryOptionsContext";
import { Provider as AuthProvider } from "./AuthContext";
import { Provider as PromoProvider } from "./PromoContext";
import { CouponProvider } from "./CouponProvider";
import { PremiumServiceProvider } from "./PremiumServiceProvider";
import { UserProfileProvider } from "./UserProfileProvider";

const theme = createMuiTheme({
  props: {
    // Name of the component ⚛️
    MuiButtonBase: {
      // The properties to apply
      disableRipple: true, // No more ripple, on the whole application 💣!
    },
  },
});

const MainProvider = (props) => {
  const [cart, updateCart] = useState({});

  useEffect(() => {}, [cart]);

  const CartManager = {
    set: function (cartObj) {
      updateCart(cartObj);
    },
    reset: function () {
      updateCart({});
    },
    addItem: function (params) {
      const storeId = params.storecode;
      const storeNm = params.storename;

      if (cart) {
        void 0 === cart[storeId] &&
          (cart[storeId] = { storeId, storeNm, items: [] });
        !this.hasItem(params) && cart[storeId].items.push(params.item);
        return true;
      } else {
        this.reset();
        return false;
      }
    },
    removeItem: function (params) {
      const storeId = params.storecode;

      if (cart && cart[storeId]) {
        cart[storeId].items = cart[storeId].items.filter(
          (x) => x.itemId !== params.productId
        );
      }
    },
    updateItem: function (params) {
      if (cart && cart[params.storecode]) {
        cart[params.storecode].items.forEach(
          (x) =>
            x.itemId === params.productId && (x.itemQuantity = params.quantity)
        );
      }

      0 === params.quantity && this.removeItem(params);
    },
    updateSelectedFlight: function (params) {
      if (cart && cart[params.storecode]) {
        cart[params.storecode].items.forEach((x) => {
          if (params.flightId && params.flightUid) {
            x.flightId = params.flightId;
            x.flightUid = params.flightUid;
          }
        });
      }
    },
    updateSelectedAddon: function (params) {
      if (cart && cart[params.storecode]) {
        cart[params.storecode].items.forEach(
          (x) => x.itemId === params.productId && (x.addOn = params.addOn)
        );
      }
    },
    getCart: function () {
      return cart;
    },
    getItem: function (params) {
      let cItem;
      const storeId = params.storecode;

      if (cart && cart[storeId]) {
        cart[storeId].items.forEach(
          (x) => x.itemId === params.productId && (cItem = x)
        );
      }

      return cItem;
    },
    getItems: function (_obj) {
      let items = [];
      const obj = _obj ? _obj : cart;

      obj && Object.values(obj).forEach((x) => (items = items.concat(x.items)));

      return items;
    },
    getStoreItems: function (storeId) {
      return cart && cart[storeId] ? cart[storeId].items : [];
    },
    isEmpty: function (_obj) {
      let flag = true;
      const obj = _obj ? _obj : cart;

      if (obj) {
        for (var store in obj) {
          if (obj && obj[store]) {
            0 < obj[store].items.length && (flag = false);
          }
        }
      }

      return flag;
    },
    hasItem: function (params) {
      const storeId = params.storecode;
      let flag = false;

      if (cart && cart[storeId]) {
        cart[storeId].items.forEach(
          (x) => x.itemId === params.productId && (flag = true)
        );
      }

      return flag;
    },
    hasService: function (params) {
      const storeId = params.storecode;
      let flag = false;
      if (cart && cart[storeId]) {
        if (params.flightUid && params.flightUid !== "") {
          cart[storeId].items.forEach((x) => {
            if (
              x.itemId === params.productId &&
              x.flightUid === params.flightUid
            ) {
              flag = true;
            }
          });
        } else {
          cart[storeId].items.forEach(
            (x) => x.itemId === params.productId && (flag = true)
          );
        }
      }
      return flag;
    },
    removeService: function (params) {
      const storeId = params.storecode;

      if (cart && cart[storeId]) {
        if (params.flightUid && params.flightUid !== "") {
          cart[storeId].items = cart[storeId].items.filter((x) => {
            return (
              x.itemId !== params.productId || x.flightUid !== params.flightUid
            );
          });
        } else {
          cart[storeId].items = cart[storeId].items.filter(
            (x) => x.itemId !== params.productId
          );
        }
      }
    },
    updateService: function (params) {
      if (cart && cart[params.storecode]) {
        if (params.flightUid && params.flightUid !== "") {
          cart[params.storecode].items.forEach((x) => {
            if (
              x.itemId === params.productId &&
              x.flightUid === params.flightUid
            ) {
              x.itemQuantity = params.quantity;
            }
          });
        } else {
          cart[params.storecode].items.forEach(
            (x) =>
              x.itemId === params.productId &&
              (x.itemQuantity = params.quantity)
          );
        }
      }

      0 === params.quantity && this.removeService(params);
    },
  };
  return (
    <MuiThemeProvider theme={theme}>
      <AuthProvider>
        <FlightProvider>
          <PromoProvider>
            <AppContext.Provider value={CartManager}>
              <DeliveryProvider>
                <CouponProvider>
                  <PremiumServiceProvider>
                    <UserProfileProvider>{props.children}</UserProfileProvider>
                  </PremiumServiceProvider>
                </CouponProvider>
              </DeliveryProvider>
            </AppContext.Provider>
          </PromoProvider>
        </FlightProvider>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

export default MainProvider;
