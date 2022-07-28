import React, { useEffect, useState, useContext } from "react";
import queryString from "query-string";
import { NavLink, useHistory } from "react-router-dom";
import moment from "moment";
import "./homepage.css";

//images
import cross from "../../assets/images/cross.svg";
import PlusGreen from "../../assets/images/plusGreen.svg";

//apicall
import config from "../../commons/config";
import webTokenConfig from "../../commons/util/webTokenConfig";
import api from "../../commons/api";

//context
import { Context as FlightContext } from "../../context/FlightsContext";
import { Context as AuthContext } from "../../context/AuthContext";
import { PremiumServiceContext } from "../../context/PremiumServiceProvider";
import AppContext from "../../commons/context";
import { Context as PromoContext } from "../../context/PromoContext";
//components
import NoFlightCard from "./subComponents/noFlightCard";
import FlightCard from "./subComponents/flightCard";
import Loader from "../loader/loader";
import PushAlert from "../../commons/notification";
import Util from "../../commons/util/util";
import Notification from "./subComponents/notification";
// import feedbackData from './notificationDummy';
export default function Homepage(props) {
  //hooks
  const ClientCart = useContext(AppContext);
  const tabContext = useContext(PremiumServiceContext);

  const [homeData, setHomeData] = useState();
  const [showSurveyContainer, setShowSurveyContainer] = useState(false);
  const [triggerFlights, setTriggerFlights] = useState(false);
  const [newsBroadcast, setNewsBroadcast] = useState("");
  const [isWebView] = useState(Util.isWebView());
  const [isLoading, setIsloading] = useState(true);
  const [isFeedbackNotification, setIsFeedbackNotification] = useState(false);
  const [notifData, setNotifData] = useState();
  const history = useHistory();

  //context
  const { myFlights, state: flightState } = useContext(FlightContext);
  const { setAuthData, state: authState } = useContext(AuthContext);
  const { setAplicablePromotions } = useContext(PromoContext);

  useEffect(() => {
    if (isWebView) handleAPICallsWebView();
    else homePageTesting();
  }, []);

  useEffect(() => {
    sendDataToReactNative();
  }, [ClientCart.isEmpty()]);

  useEffect(() => {
    const parsed = queryString.parse(props.location.search);

    if (parsed && parsed.responseData) {
      setIsFeedbackNotification(true);
      setNotifData(JSON.parse(parsed.responseData));
    }
  }, [props.location.search]);

  useEffect(() => {
    checkPayRedir();
  }, [authState.accountID]);

  useEffect(() => {
    if (isWebView) getFlights(authState.accountID);
    else getFlights("GUEST_USER");
  }, [triggerFlights]);

  function homePageTesting() {
    runHomePageApi();
    getNewsBroadcast();
  }

  function handleAPICallsWebView() {
    const parsed = queryString.parse(props.location.search);
    if (
      parsed &&
      parsed.accessToken &&
      parsed.refreshToken &&
      parsed.expiresAt
    ) {
      webTokenConfig.setToken(
        parsed.accountId,
        parsed.accessToken,
        parsed.refreshToken,
        parsed.expiresAt
      );

      setAuthData(parsed.accountId, parsed.accessToken);
      runHomePageApi();
      getNewsBroadcast();
      getFlights(parsed.accountId);
      setAplicablePromotions(parsed.accountId);
      restoreCart(parsed.accessToken);
    } else {
      webTokenConfig.getUser().then((webUser) => {
        if (webUser) {
          setAuthData(webUser.accountId);
          runHomePageApi();
          getNewsBroadcast();
          getFlights(webUser.accountId);
          setAplicablePromotions(webUser.accountId);
        }
      });
    }
  }

  function restoreCart() {
    if (ClientCart.isEmpty()) {
      api
        .get(config.api.mycart)
        .then((data) => {
          if (data.type === "success" && data.status === 200) {
            data.data.data.products.forEach((product) => {
              let addParam = {};
              if (product.flight && product.flight.id) {
                addParam = {
                  storecode: product.storeInfo.storeId,
                  storename: product.storeInfo.storeName,
                  item: {
                    itemId: product.itemId,
                    itemQuantity: product.itemQuantity,
                    itemType: product.itemType,
                    addOn: product.addOns,
                    flightId: product.flight.id,
                    flightUid: product.flight.uid,
                  },
                };
              } else {
                addParam = {
                  storecode: product.storeInfo.storeId,
                  storename: product.storeInfo.storeName,
                  item: {
                    itemId: product.itemId,
                    itemQuantity: product.itemQuantity,
                    itemType: product.itemType,
                    addOn: product.addOns,
                  },
                };
              }
              ClientCart.addItem(addParam);
            });
            // data.data.data.services.forEach((service) => {
            //   const addParam = {
            //     storecode: service.ancestorsId,
            //     storename: service.itemLabel,
            //     item: {
            //       itemId: service.itemId,
            //       itemLabel: service.itemLabel,
            //       itemPrice: service.price.basePrice,
            //       itemQuantity: service.itemQuantity,
            //       maxQuantity: 5,
            //       itemType: service.itemType,
            //       flightId: service.flight.id,
            //       flightUid: service.flight.uid,
            //     },
            //   };
            //   ClientCart.addItem(addParam);
            // });
          } else {
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        "Home" + "-" + ClientCart.isEmpty()
      );
  }

  const checkPayRedir = () => {
    const redirStr = window.sessionStorage.getItem("payRedir");

    if (
      !(
        void 0 === redirStr ||
        "" === redirStr ||
        " " === redirStr ||
        null === redirStr
      )
    ) {
      const redirObj = JSON.parse(redirStr);

      ClientCart.set(redirObj);
    }

    window.sessionStorage.setItem("payRedir", "");
  };

  function runHomePageApi() {
    api
      .get(config.api.homescreen, {})
      .then((data) => {
        setHomeData(data.data[0]);
        setIsloading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getFlights(accId) {
    //   alert("GetFlights", accId);
    //  console.log("GetFlights", accId);
    myFlights(accId);
  }

  function getNewsBroadcast() {
    const apiURL = config.api.newsBroadcast;
    api
      .get(apiURL)
      .then((response) => {
        if (response.title) {
          setNewsBroadcast(response.title);
          setShowSurveyContainer(true);
        } else setShowSurveyContainer(false);
      })
      .catch((error) => {
        console.log(error);
        setShowSurveyContainer(false);
      });
  }

  function getRoute(name) {
    switch (name) {
      case "Premium Services":
        tabContext.setTabIndex(0);
        return "/premiumServices";
        break;
      case "Shopping":
        return "/";
        break;
      case "Order Food":
        return "/";
        break;
      case "Duty Free":
        return "/";
        break;
      default:
        return "";
    }
  }

  function handleSpecialOffersClick() {
    history.push({
      pathname: `/myOffers`,
    });
  }

  function goToNewsAndBlogs(url) {
    if (url !== undefined || url !== null || url !== "") {
      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(
          "News And Blog" + "-" + ClientCart.isEmpty()
        );
      window.location.href = url;
    } else {
      PushAlert("Session Lost...");
    }
  }

  return (
    <div className="homepage-container">
      {/* <button onClick={() => history.push('/myBookings')}>
        Go To MyBookings
      </button> */}
      {/* <button onClick={() => history.push('/myFlights')}>
        Go To MyFlights
      </button> */}
      {/* <button onClick={() => history.push('/airportGuide')}>
        Go To Airport Guide
      </button> */}
      {/* <button onClick={() => history.push('/userProfile')}>
        Go To User Profile
      </button> */}
      {/* <button onClick={() => history.push('/cart')}>Go To Cart</button> */}
      {homeData && !isLoading ? (
        <>
          {isFeedbackNotification && notifData ? (
            <Notification
              notifData={notifData}
              setNotifData={setNotifData}
              setIsFeedbackNotification={setIsFeedbackNotification}
            />
          ) : null}
          {showSurveyContainer ? (
            <div className="survey-container">
              <div className="survey-text">
                {newsBroadcast}
                {/* Our airport steps up measures to limit the spread of COVID-19.
                Please{' '}
                <span style={{ color: '#47B896' }}>
                  fill the health assessment form
                </span>{' '}
                for your flight. */}
              </div>
              <div
                className="survey-cross-container"
                onClick={() => setShowSurveyContainer(false)}
              >
                <img src={cross} height="20" width="20" />
              </div>
            </div>
          ) : null}
          <div className="myflights-container">
            <div className="header-text">
              My Flights{" "}
              {flightState.flightData.length > 1
                ? `(${flightState.flightData.length})`
                : null}
            </div>
            {flightState.flightData.length ? (
              <div
                className="flights-cards-wrapper"
                style={
                  flightState.flightData.length === 1
                    ? { justifyContent: "center" }
                    : null
                }
              >
                <div
                  className="flights-cards-wrapper-horzScroll"
                  style={{
                    gridTemplateColumns: `repeat(
                    ${flightState.flightData.length},
                    ${1 === flightState.flightData.length ? "85vw" : "18rem"}
                  )`,
                  }}
                >
                  {flightState.flightData.map((item) => (
                    <FlightCard
                      key={item.UID}
                      flightData={item}
                      triggerState={triggerFlights}
                      triggerSetter={setTriggerFlights}
                      isWebView={isWebView}
                      caller="Homepage"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <NoFlightCard />
            )}
            <div className="add-button-container">
              {flightState.flightData.length ? (
                <NavLink
                  className="add-button"
                  to={{
                    pathname: "/addNewFlight",
                  }}
                >
                  <img src={PlusGreen} height="23" width="23" />
                </NavLink>
              ) : null}
            </div>
          </div>
          <div className="special-offers-container">
            <div
              className="homescreen-section-header-container"
              onClick={() => handleSpecialOffersClick()}
            >
              <div className="section-header">Special Offers</div>
              <div className="section-header-viewText">{">"}</div>
            </div>
            <div className="store-offer-container">
              <div
                className="horz-scroll-category"
                style={{
                  gridTemplateColumns: `repeat(
                    ${homeData.campaigns.length}, 
                    ${1 === homeData.campaigns.length ? "90vw" : "18rem"}
                  )`,
                  marginLeft: -35,
                }}
              >
                {homeData.campaigns.map((item, index) => (
                  <div className="store-offer" key={index}>
                    <img
                      src={item.img}
                      alt="Oops, no image!!"
                      className="offer-image"
                      width="280"
                      height="150"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="service-cards-wrapper">
            {homeData.services.map((item) => (
              <NavLink
                to={{
                  pathname: getRoute(item.name),
                  state: {
                    categoryToShow: item.name,
                  },
                }}
                key={item.code}
                style={{ textDecoration: "none", color: "black" }}
              >
                <div className="service-card-container">
                  <div className="service-card-image">
                    <img src={item.img} height="30" width="30"></img>
                  </div>
                  <div className="service-card-text">{item.name}</div>
                </div>
              </NavLink>
            ))}
          </div>
          <div className="trending-cards-container">
            <div
              className="homescreen-section-header-container"
              onClick={() =>
                goToNewsAndBlogs(
                  `https://ecommerce.contactless-shoppingdev.com:3535/article/${authState.accountID}`
                )
              }
            >
              <div className="section-header">Trending Today</div>
              <div className="section-header-viewText">{">"}</div>
            </div>
            <div className="trending-cards-wrapper">
              <div
                className="trending-cards-wrapper-horzScroll"
                style={{
                  gridTemplateColumns: `repeat(
                    ${homeData.news.length}, 
                    ${1 === homeData.news.length ? "90vw" : "13.5rem"}
                  )`,
                }}
              >
                {homeData.news.map((item) => (
                  <div
                    className="trending-card-container"
                    key={item.code}
                    onClick={() => goToNewsAndBlogs(item.articleUrl)}
                  >
                    <div className="card-image">
                      <img
                        src={item.img}
                        height="100%"
                        width="100%"
                        style={{ borderRadius: "16pt" }}
                      />
                    </div>
                    <div className="card-sub-text">
                      {moment(
                        item.articleDate.slice(0, 10),
                        "YYYY-MM-DD"
                      ).format("DD MMMM YYYY")}
                    </div>
                    <div className="card-text">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flex: "1 1 0%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Loader />
        </div>
      )}
    </div>
  );
}
