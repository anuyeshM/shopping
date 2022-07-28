// dependencies
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useRouteMatch, useHistory } from "react-router-dom";
import $ from "jquery";
import MobileVerification from "../../components/mobileVerification/verificationComponent";
import CartItem from "./subcomponent/cartItem";
import RecommendationItem from "./subcomponent/recommendationItem";
import { Context as DeliveryOptionsContext } from "../../context/DeliveryOptionsContext";
import { Context as AuthContext } from "../../context/AuthContext";
import { Context as FlightContext } from "../../context/FlightsContext";
import { CouponContext } from "../../context/CouponProvider";
import { Context as PromoContext } from "../../context/PromoContext";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Collapse from "@material-ui/core/Collapse";

// misc
import Loader from "../loader/loader";
import config from "../../commons/config";
import AppContext from "../../commons/context";
import Header from "../header/headerComponent";
import "./cartStyle.css";
import PushAlert from "../../commons/notification";
import IconDelivery from "../../assets/images/iconDelivery.svg";
import ArrowUp from "../../assets/images/arrowUpGreen.svg";
import api from "../../commons/api";
import Util from "../../commons/util/util";

const sumResponse = require("./dummyDataSummary.json");
const sumBody = require("./dummyReqBody.json");

const useStyles = makeStyles(
  (theme) => ({
    expand: {
      display: "flex",
      transform: "rotate(0deg)",
      transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: "rotate(180deg)",
    },
  }),
  { index: 1 }
);

function GetDeliveryStatus({ selectedDeliveryData, shopId }) {
  const [deliveryStatus, setDeliveryStatus] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("");
  useEffect(() => {
    selectedDeliveryData.forEach((item) => {
      if (item.storeId === shopId) {
        if (item.selected) {
          setDeliveryStatus(true);
          setDeliveryOption(item.deliveryOption);
        } else {
          setDeliveryStatus(false);
        }
      }
    });
  }, []);
  return <div>{deliveryStatus ? deliveryOption : "Add Delivery"}</div>;
}

function GetMoreInfoStatus({ ancestorsId, itemId, flightUid, cart }) {
  const [moreInfoStatus, setMoreInfoStatus] = useState(false);
  useEffect(() => {
    cart[ancestorsId].items.forEach((item) => {
      if (flightUid !== undefined && flightUid !== "Others") {
        if (
          item.itemId === itemId &&
          item.flightUid === flightUid &&
          item.mandatoryFieldsFilled === true
        ) {
          setMoreInfoStatus(true);
        }
      } else {
        if (item.itemId === itemId && item.mandatoryFieldsFilled === true) {
          setMoreInfoStatus(true);
        }
      }
    });
  }, []);
  return <div style={moreInfoStatus ? {} : { color: "red" }}>More Info</div>;
}

export default function Cart(props) {
  const classes = useStyles();
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const ClientCart = useContext(AppContext);
  const { state: authState, hardSetAuthData } = useContext(AuthContext);
  const { state: flightState, myFlights } = useContext(FlightContext);
  const { state: promoState } = useContext(PromoContext);
  const couponContext = useContext(CouponContext);
  const {
    createSelectedDeliveries,
    state: deliveryState,
    resetSelectedDeliveries,
    createDeliveriesRedir,
    createSelectedDeliveriesRedir,
  } = useContext(DeliveryOptionsContext);
  const history = useHistory();
  const rootPath = useRouteMatch();
  const [isWebView] = useState(Util.isWebView());
  const [isReRender, setReRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [willCheckout, setWillCheckout] = useState(false);
  const [priceSummary, setPriceSummary] = useState({});
  const [showAlertBox, setShowAlertBox] = useState(false);
  const [showOffersBox, setShowOffersBox] = useState(false);
  const [applicableOffers, setApplicableOffers] = useState([]);

  //**for promo code */
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [couponAmount, setCouponAmount] = useState();

  const [headerParams] = useState({
    gobackEnabled: true,
    showScanner: false,
    showCart: true,
    staticHeaderText: true,
    gobackLinkRef:
      window.store && window.store.storecode ? window.store.storecode : "",
    headerText: "Shopping Cart",
    headerTextLinkRef: "",
    storecode:
      window.store && window.store.storecode ? window.store.storecode : "",
    rootPath: rootPath.url,
  });

  useEffect(() => {
    if (isWebView) sendDataToReactNative();
  }, [isReRender, isWebView]);

  useEffect(() => {
    const $root = $(document);
    const sessRef = checkPayRedir();
    const delRef = checkDeliveryRedir();
    const selDelRef = checkSelectedDeliveryRedir();
    checkAccountRedir();
    checkCouponRedir();
    // const reqData = sessRef ? sessRef : ClientCart.getCart();

    const reqData = ClientCart.isEmpty()
      ? sessRef && ClientCart.isEmpty(sessRef)
        ? ClientCart.getItems()
        : ClientCart.getItems(sessRef)
      : ClientCart.getItems();

    async function getPriceSummary_v2(reqData) {
      let ruleId = "";

      promoState.applicablePromo &&
        promoState.applicablePromo.forEach((x) => {
          if (x["call-at"] === "ONCART") {
            ruleId = x.rule_id;
          }
        });
      // fetch price summary

      let localObj = ClientCart.getCart();
      let cartObject = ClientCart.getCart();
      Object.entries(cartObject).forEach((item) => {
        let isProduct = false;
        deliveryState.selectedDeliveryData.forEach((deliveryItem) => {
          if (item[0] === deliveryItem.storeId) {
            localObj = item[1].items;
            let deliveryObject = {
              deliveryOption: deliveryItem.deliveryOption,
              deliveryPincode: deliveryItem.deliveryPincode,
            };
            item[1].items.forEach((x) => {
              x.deliveryOptions = deliveryObject;
            });
          }
        });
      });

      let cartArray = [...reqData];
      cartArray.forEach((ele) => {
        ele.ruleId = ruleId;
        //ele.serviceData = "20220509";
      });
      setIsLoading(true);
      api
        .patch(config.api.summary, {
          promo: promoCode ? promoCode.toUpperCase() : "",
          ruleId,
          items: cartArray,
        })
        .then((priceSummaryRaw) => {
          if (priceSummaryRaw.status === 200) {
            if (promoApplied) {
              if (
                priceSummaryRaw.metadata.coupon &&
                priceSummaryRaw.metadata.coupon.applied
              ) {
                setPromoError(false);
                setCouponAmount(priceSummaryRaw.metadata.priceSummary.coupon);
              } else setPromoError(true);
            }
            const sumData = convertv2(priceSummaryRaw);
            setPriceSummary(sumData);
            setIsLoading(false);

            if (ClientCart.isEmpty() && !sessRef) {
              resetSelectedDeliveries(true);
            } else {
              if (!(delRef && selDelRef)) {
                createSelectedDeliveries(
                  sumData.flights,
                  deliveryState.selectedDeliveryData,
                  deliveryState.deliveryData
                );
              }
            }
          } else {
            ClientCart.reset();
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
          ClientCart.reset();
          setIsLoading(false);
        });
    }
    getPriceSummary_v2(reqData);

    if (ClientCart.isEmpty()) {
      $root.find('[data-id="headerCart"]').addClass("header-cart-empty");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-filled");
    } else {
      $root.find('[data-id="headerCart"]').addClass("header-cart-filled");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-empty");
    }
  }, [isReRender, promoApplied]);

  function convertv2(response) {
    let summaryData = {
      flights: [],
      metadata: response.metadata,
    };

    let rawData = response;
    let noStock = 0;
    let finalApplicableOffers = [];

    rawData.data &&
      rawData.data.products.forEach((product) => {
        // if (product.isAvailable) {
        Array.prototype.push.apply(
          finalApplicableOffers,
          product.applicableOffers
        );
        const flightUid = product.flight.uid ? product.flight.uid : "Others";
        const itemId = product.storeInfo.storeId
          ? product.storeInfo.storeId
          : "";

        let flightFlag = false;

        summaryData.flights.forEach((flight) => {
          if (flightUid === flight.flightUid) {
            flightFlag = true;

            let storeFlag = false;
            flight.cartItems.map((cartItem) => {
              if (itemId === cartItem.itemId) {
                storeFlag = true;
                cartItem.items.push(product);
              }
            });
            if (!storeFlag) {
              let store = {
                itemId: itemId,
                itemName: product.storeInfo.storeName,
                itemType: product.itemType,
                items: [product],
              };
              flight.cartItems.push(store);
            }
          }
        });

        if (!flightFlag) {
          if (flightUid === "Others") {
            let store = {
              itemId: itemId,
              itemName: product.storeInfo.storeName,
              itemType: product.itemType,
              items: [product],
            };

            let newFlightItem = {
              flightId: "Others",
              flightUid: flightUid,
              cartItems: [store],
            };
            summaryData.flights.push(newFlightItem);
          } else {
            let store = {
              itemId: itemId,
              itemName: product.storeInfo.storeName,
              itemType: product.itemType,
              items: [product],
            };

            let newFlightItem = {
              flightId: product.flight.id,
              flightUid: flightUid,
              source: product.flight.source,
              destination: product.flight.destination,
              scheduledDate: moment(product.flight.estimatedDeparture).format(
                "DD-MM-YY"
              ),
              scheduledTime: moment(product.flight.estimatedDeparture).format(
                "HH:mm:SS"
              ),
              estimatedDeparture: product.flight.estimatedDeparture,
              sector: product.flight.sector,
              gate: product.flight.gate,
              cartItems: [store],
            };
            summaryData.flights.push(newFlightItem);
          }
        }

        product.alerts &&
          product.alerts.forEach((item) => {
            if (item.priority <= 5) setShowAlertBox(true);
          });

        // } else {
        //   const removeParam = {
        //     storecode: product.storeInfo.storeId,
        //     productId: product.itemId,
        //   };
        //   ClientCart.removeItem(removeParam);
        //   noStock = noStock + 1;
        // }
      });
    setApplicableOffers(finalApplicableOffers);
    rawData.data &&
      rawData.data.services.forEach((service) => {
        const flightUid = service.flight.uid ? service.flight.uid : "Others";
        let flightFlag = false;

        summaryData.flights.forEach((flight) => {
          if (flightUid === flight.flightUid) {
            flightFlag = true;

            flight.cartItems.push(service);
          }
        });

        if (!flightFlag) {
          let newFlightItem = {
            flightId: service.flight.id,
            flightUid: flightUid,
            source: service.flight.source,
            destination: service.flight.destination,
            scheduledDate: moment(service.flight.estimatedDeparture).format(
              "DD-MM-YY"
            ),
            scheduledTime: moment(service.flight.estimatedDeparture).format(
              "HH:mm:SS"
            ),
            estimatedDeparture: service.flight.estimatedDeparture,
            sector: service.flight.sector,
            gate: service.flight.gate,
            cartItems: [service],
          };

          summaryData.flights.push(newFlightItem);
        }

        service.alerts &&
          service.alerts.forEach((item) => {
            if (item.priority <= 5) setShowAlertBox(true);
          });
      });

    if (noStock > 0) {
      PushAlert.info(
        `${noStock} ${noStock > 1 ? "items" : "item"} ${
          noStock > 1 ? "are" : "is"
        } out of stock.`
      );
    }

    return summaryData;
  }

  const checkPayRedir = () => {
    const redirStr = window.sessionStorage.getItem("payRedir");
    let redirObj;

    if (
      !(
        void 0 === redirStr ||
        "" === redirStr ||
        " " === redirStr ||
        null === redirStr
      )
    ) {
      redirObj = JSON.parse(redirStr);

      ClientCart.set(redirObj);
    }

    window.sessionStorage.setItem("payRedir", "");

    return redirObj;
  };

  const checkDeliveryRedir = () => {
    const delRedirStr = window.sessionStorage.getItem("delRedir");
    let delRedirAr;

    if (
      !(
        void 0 === delRedirStr ||
        "" === delRedirStr ||
        " " === delRedirStr ||
        null === delRedirStr
      )
    ) {
      delRedirAr = JSON.parse(delRedirStr);
      createDeliveriesRedir(delRedirAr);
    }

    window.sessionStorage.setItem("delRedir", "");

    return delRedirAr;
  };

  const checkSelectedDeliveryRedir = () => {
    const selDelRedirStr = window.sessionStorage.getItem("selDelRedir");
    let selDelRedirAr;

    if (
      !(
        void 0 === selDelRedirStr ||
        "" === selDelRedirStr ||
        " " === selDelRedirStr ||
        null === selDelRedirStr
      )
    ) {
      selDelRedirAr = JSON.parse(selDelRedirStr);
      createSelectedDeliveriesRedir(selDelRedirAr);
    }

    window.sessionStorage.setItem("selDelRedir", "");

    return selDelRedirAr;
  };

  const checkAccountRedir = () => {
    const accountIDRedirStr = window.sessionStorage.getItem("accountIdRedir");
    if (
      !(
        void 0 === accountIDRedirStr ||
        "" === accountIDRedirStr ||
        " " === accountIDRedirStr ||
        null === accountIDRedirStr
      )
    ) {
      let accountId = JSON.parse(accountIDRedirStr);
      getUserDetails(accountId);
      myFlights(isWebView ? accountId : "GUEST_USER");
    }

    window.sessionStorage.setItem("accountIdRedir", "");
  };

  const checkCouponRedir = () => {
    const couponAmountRedirStr =
      window.sessionStorage.getItem("couponAmountRedir");
    const couponsListRedirStr =
      window.sessionStorage.getItem("couponsListRedir");

    if (
      !(
        void 0 === couponAmountRedirStr ||
        "" === couponAmountRedirStr ||
        " " === couponAmountRedirStr ||
        null === couponAmountRedirStr
      )
    ) {
      let couponAmount = JSON.parse(couponAmountRedirStr);
      if (couponAmount > 0) {
        couponContext.setCouponAmount(couponAmount);
      }
    }

    if (
      !(
        void 0 === couponsListRedirStr ||
        "" === couponsListRedirStr ||
        " " === couponsListRedirStr ||
        null === couponsListRedirStr
      )
    ) {
      let couponsList = JSON.parse(couponsListRedirStr);
      if (couponsList.length > 0) {
        couponContext.setCouponsList(couponsList);

        setPromoCode(couponsList[0]);
      }
    }

    window.sessionStorage.setItem("couponAmountRedir", "");
    window.sessionStorage.setItem("couponsListRedir", "");
  };

  const getUserDetails = async (accountId) => {
    let reqPath = config.api.getUserDetails_v2.replace("{{id}}", accountId);
    const apiResponse = await api.get(reqPath, {});

    let regResponse = await apiResponse;

    let name = "";
    let contact = "";
    let email = "";

    if ("success" === regResponse.type && 200 === regResponse.status) {
      name = regResponse.data.fullName;
      contact = regResponse.data.mobile;
      email = regResponse.data.email;

      hardSetAuthData(accountId, name, contact, email);
    }
  };

  const doCheckout = () => {
    console.log("doCheckout");
    if (!ClientCart.isEmpty() && !isWebView) {
      let cartObj = ClientCart.getItems();
      if (
        cartObj.filter(function (e) {
          return e.itemType === "service" && !e.mandatoryFieldsFilled;
        }).length === 0
      ) {
        setWillCheckout(true);
      } else {
        PushAlert.warning(
          `Please fill the mandatory fields by clicking on More Info!`
        );
      }
    }
    if (isWebView) {
      let selDelAr = deliveryState.selectedDeliveryData;
      let readyForCheckout = true;
      let mandatoryFilled = true;
      selDelAr.forEach((item) => {
        if (item.itemtype === "product" && item.selected === false) {
          readyForCheckout = false;
        }
      });
      if (!ClientCart.isEmpty()) {
        let cartObj = ClientCart.getItems();
        if (
          cartObj.filter(function (e) {
            return e.itemType === "service" && !e.mandatoryFieldsFilled;
          }).length === 0
        ) {
          mandatoryFilled = true;
        } else {
          mandatoryFilled = false;
        }
      }
      if (readyForCheckout && mandatoryFilled)
        !ClientCart.isEmpty() && setWillCheckout(true);
      else if (!readyForCheckout)
        PushAlert.warning(`Please add delivery options for selected products!`);
      else if (!mandatoryFilled)
        PushAlert.warning(
          `Please fill the mandatory fields by clicking on More Info!`
        );
    }
  };

  const randomNumber = () => {
    return Math.floor(
      Math.random() * (config.cart.emptyMessage.length - 1 + 1) + 0
    );
  };

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        "Shopping Cart" + "-" + ClientCart.isEmpty()
      );
  }

  function goToStorePage(itemType, storeId) {
    if (itemType === "product") history.push(`/${storeId}`);
    else history.push(`/premiumServices`);
  }

  function goToOrderDelivery(storeId, storeName, items) {
    history.push({
      pathname: `/orderDelivery`,
      state: {
        storeId,
        storeName,
        items,
      },
    });
  }

  function goToMoreInfo(ancestorsId, itemId, skuCode, itemName, flight) {
    history.push({
      pathname: `/moreInfo`,
      state: {
        ancestorsId,
        itemId,
        skuCode,
        itemName,
        selectedFlightUid:
          Object.keys(flight).length > 0 ? (flight.uid ? flight.uid : "") : "",
      },
    });
  }

  return (
    <div className="cart-container">
      {isLoading ? (
        <div>
          {isWebView ? null : <Header {...headerParams} />}
          <div
            style={{
              textAlign: "center",
              paddingTop: "15rem",
              height: "100%",
              backgroundColor: "#f7f7f7",
            }}
          >
            <Loader />
          </div>
        </div>
      ) : (
        <div style={{ height: "100%" }}>
          {isWebView ? null : <Header {...headerParams} />}
          {ClientCart.isEmpty() ? (
            <div className="empty-cart">
              <div className="empty-cart-icon"></div>
              <div className="text">Oops! Such a lonely cart...</div>
              <div className="description">
                {config.cart.emptyMessage[randomNumber()]}
              </div>
              <div
                className="browse-store"
                onClick={(x) => {
                  isWebView ? history.push(`/homepage`) : history.push(`/`);
                }}
              >
                <div className="discover-label">Discover More</div>
              </div>
            </div>
          ) : (
            <div
              className="cart"
              style={
                isWebView
                  ? { paddingTop: "0rem", height: "100vh" }
                  : { paddingTop: "4rem", height: "calc(100vh - 5rem)" }
              }
            >
              <div
                className={
                  isWebView
                    ? "purchase-item-container-webview"
                    : "purchase-item-container"
                }
              >
                <div data-id="purchaseItems" className="purchase-items">
                  <div>
                    {priceSummary.flights.map((flightItem, flightIndex) => (
                      <div
                        style={{ margin: "10pt 0pt" }}
                        key={flightItem.flightUid}
                      >
                        {isWebView ? (
                          <div
                            className="booking-flight-band-wrapper"
                            key={flightItem.flightUid}
                          >
                            <pre
                              style={{
                                marginBottom: "0pt",
                                marginTop: "0pt",
                              }}
                            >
                              {" "}
                              {flightItem.flightId != "Others" &&
                              flightItem.flightUid != "Others"
                                ? `Flight  ${flightItem.flightId}  ${
                                    flightItem.source
                                  }  -  ${flightItem.destination}  ${
                                    flightItem.scheduledDate
                                  }  ${flightItem.scheduledTime.slice(0, 5)}`
                                : "Other Orders"}
                            </pre>
                          </div>
                        ) : null}
                        {flightItem.cartItems.map((cartItem, cartIndex) => (
                          <div
                            className={`store-group group${cartIndex}`}
                            style={
                              cartIndex === flightItem.cartItems.length - 1
                                ? { margin: "10px 0px 10px auto" }
                                : { margin: "10px 0px 20px auto" }
                            }
                            key={cartIndex}
                          >
                            <div className="cart-item-header-wrapper">
                              <div
                                className={`group-name ${cartItem.itemType}`}
                                onClick={(e) =>
                                  goToStorePage(
                                    cartItem.itemType,
                                    cartItem.itemId
                                  )
                                }
                              >
                                {cartItem.itemName &&
                                cartItem.itemName.length > 25
                                  ? cartItem.itemName.substring(0, 25) + "..."
                                  : cartItem.itemName}
                              </div>
                              {cartItem.itemType === "product" && isWebView ? (
                                <div
                                  className="add-delivery-wrapper"
                                  onClick={() =>
                                    goToOrderDelivery(
                                      cartItem.items[0].storeInfo.storeId,
                                      cartItem.items[0].storeInfo.storeName,
                                      cartItem.items
                                    )
                                  }
                                >
                                  <img
                                    src={IconDelivery}
                                    height="22"
                                    width="22"
                                  />
                                  <div className="add-delivery-text">
                                    <GetDeliveryStatus
                                      selectedDeliveryData={
                                        deliveryState.selectedDeliveryData
                                      }
                                      shopId={
                                        cartItem.items[0].storeInfo.storeId
                                      }
                                    />
                                  </div>
                                </div>
                              ) : null}
                              {cartItem.itemType === "variant" ? (
                                <div
                                  className="add-delivery-wrapper"
                                  onClick={() =>
                                    goToMoreInfo(
                                      cartItem.ancestorsId,
                                      cartItem.itemId,
                                      cartItem.skuCode,
                                      cartItem.itemName,
                                      cartItem.flight
                                    )
                                  }
                                >
                                  <div
                                    className="add-delivery-text"
                                    style={{ fontSize: "9pt" }}
                                  >
                                    <GetMoreInfoStatus
                                      ancestorsId={cartItem.ancestorsId}
                                      itemId={cartItem.itemId}
                                      flightUid={flightItem.flightUid}
                                      cart={ClientCart.getCart()}
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            {cartItem.itemType === "product"
                              ? cartItem.items.map((subItem, subIndex) => (
                                  <CartItem
                                    {...subItem}
                                    onChange={setReRender}
                                    changeFlag={isReRender}
                                    showAlertBox={showAlertBox}
                                    key={`cartItem_${subIndex}`}
                                  />
                                ))
                              : cartItem.itemType === "variant" && (
                                  <CartItem
                                    {...cartItem}
                                    onChange={setReRender}
                                    changeFlag={isReRender}
                                    showAlertBox={showAlertBox}
                                    key={`cartItem_${cartIndex}`}
                                  />
                                )}
                          </div>
                        ))}
                      </div>
                    ))}
                    {priceSummary.metadata.recommendation.products &&
                    priceSummary.metadata.recommendation.products.length > 0 ? (
                      <div className="recommendation-container">
                        <span className="recommendation-container-title">
                          Recommendation For You
                        </span>
                        {priceSummary.metadata.recommendation.products.map(
                          (item, index) => (
                            <RecommendationItem
                              key={index}
                              item={item}
                              onChange={setReRender}
                              changeFlag={isReRender}
                            />
                          )
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className={"purchase-summary"}>
                <div
                  className="purchase-summary-trigger-container"
                  onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                >
                  <div
                    className={clsx(classes.expand, {
                      [classes.expandOpen]: isSummaryOpen,
                    })}
                    aria-expanded={isSummaryOpen}
                    aria-label="trigger purchase summary"
                  >
                    <img
                      src={ArrowUp}
                      alt="no image found"
                      height="15pt"
                      width="15pt"
                    />
                  </div>
                </div>
                {isSummaryOpen ? (
                  <div
                  // className={
                  //   isSummaryOpen
                  //     ? 'purchase-summary-collapse-wrapper summary-show'
                  //     : 'purchase-summary-collapse-wrapper'
                  // }
                  //  in={isSummaryOpen} collapsedHeight={0}
                  >
                    <div className="sub-total">
                      <div className="sub-total-label">Subtotal</div>
                      <div className="sub-total-value">
                        {priceSummary.metadata.priceSummary.currency
                          ? `${
                              priceSummary.metadata.priceSummary.currency
                            } ${parseFloat(
                              priceSummary.metadata.priceSummary.total
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`
                          : `₹ ${parseFloat(
                              priceSummary.metadata.priceSummary.total
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`}
                      </div>
                    </div>
                    <div className="tax">
                      <div className="tax-label">Total Tax</div>
                      <div className="tax-value">
                        {priceSummary.metadata.priceSummary.currency
                          ? `${
                              priceSummary.metadata.priceSummary.currency
                            } ${parseFloat(
                              priceSummary.metadata.priceSummary.taxes
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`
                          : `₹ ${parseFloat(
                              priceSummary.metadata.priceSummary.taxes
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`}
                      </div>
                    </div>
                    <div className="discount">
                      <div className="discount-label">Total Discount</div>
                      <div className="discount-value">
                        {priceSummary.metadata.priceSummary.currency
                          ? `${
                              priceSummary.metadata.priceSummary.currency
                            } ${parseFloat(
                              priceSummary.metadata.priceSummary.discounts
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`
                          : `₹ ${parseFloat(
                              priceSummary.metadata.priceSummary.discounts
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`}
                      </div>
                    </div>
                    <div className="tax">
                      <div className="tax-label">Delivery Charges</div>
                      <div className="tax-value">
                        {priceSummary.metadata.priceSummary.currency
                          ? `${
                              priceSummary.metadata.priceSummary.currency
                            } ${parseFloat(
                              priceSummary.metadata.priceSummary.delivery
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`
                          : `₹ ${parseFloat(
                              priceSummary.metadata.priceSummary.delivery
                            ).toLocaleString("en", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}`}
                      </div>
                    </div>
                    <div className="promo-container">
                      {isWebView ? (
                        <div>
                          {couponAmount ? (
                            <div className="discount">
                              <div className="discount-label">
                                Coupon Discount
                              </div>
                              <div className="discount-value">
                                {priceSummary.currency
                                  ? `${
                                      priceSummary.currency
                                    } ${couponAmount.toLocaleString("en", {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: 2,
                                    })}`
                                  : `₹ ${couponAmount.toLocaleString("en", {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: 2,
                                    })}`}
                              </div>
                            </div>
                          ) : null}
                          <div className="promo">
                            <div className="promo-icon"></div>
                            <div className="promo-label">
                              Have a promo code ?
                            </div>
                            <input
                              data-id="promoText"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              className={`promo-text ${
                                promoError ? "promo-error" : ""
                              }`}
                              type="search"
                              spellCheck={false}
                              readOnly={promoApplied}
                            />
                            {!promoApplied ? (
                              <div
                                data-id="promoApply"
                                className={`${
                                  promoCode.length < 1 ? "disabled-text" : ""
                                } promo-apply`}
                                onClick={() => setPromoApplied(true)}
                              >
                                Apply
                              </div>
                            ) : (
                              <div
                                data-id="promoApply"
                                className="promo-apply"
                                onClick={() => {
                                  setPromoApplied(false);
                                  setPromoCode("");
                                  setPromoError(false);
                                  setCouponAmount(null);
                                }}
                              >
                                Remove
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="promo-container">
                      <div>
                        <div className="offers">
                          <div className="offers-icon"></div>
                          <div className="offers-label">Available Offers</div>
                          <div
                            className="offers-action"
                            onClick={() => setShowOffersBox(true)}
                          >
                            Check
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="purchase-total-discount-wrapper">
                  <div className="order-total">
                    <div className="order-total-label">Order Total</div>
                    <div className="order-total-value">
                      {priceSummary.metadata.priceSummary.currency
                        ? `${
                            priceSummary.metadata.priceSummary.currency
                          } ${parseFloat(
                            priceSummary.metadata.priceSummary.priceToPay
                          ).toLocaleString("en", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}`
                        : `₹ ${parseFloat(
                            priceSummary.metadata.priceSummary.priceToPay
                          ).toLocaleString("en", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}`}
                    </div>
                  </div>
                  <div className="checkout">
                    <div
                      data-id="doCheckout"
                      className={`${
                        ClientCart.isEmpty() ? "disabled" : ""
                      } do-checkout`}
                      onClick={doCheckout}
                    >
                      Checkout Order
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {willCheckout && (
        <MobileVerification
          {...props}
          onChange={setWillCheckout}
          promoCode={promoCode}
        />
      )}
      {showOffersBox && (
        <div className="offerModalContainer">
          <div className="offerModalWrapper">
            <div
              className="closeModalIcon"
              onClick={() => setShowOffersBox(false)}
            ></div>
            <div className="offerModalContent">
              <span className="offerModalTitle">Available Offer:</span>
              <div className="offersListContainer">
                {applicableOffers && applicableOffers.length > 0 ? (
                  applicableOffers.map((item, index) => (
                    <div className="offersListWrapper" key={index}>
                      <div className="offersListIcon"></div>
                      <div className="offerListItem">
                        <span className="offerProdName">{item.itemName}</span>
                        <span className="offerName">{item.message}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span>No offers available for selected products</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
