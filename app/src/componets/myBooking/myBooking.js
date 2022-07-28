//dependencies
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  Fragment,
} from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import queryString from "query-string";

//context
import { Context as AuthContext } from "../../context/AuthContext";
import { Context as MyFlightsContext } from "../../context/FlightsContext";
import AppContext from "../../commons/context";

//components
import "./myBooking.css";
import Loader from "../loader/loader";
import config from "../../commons/config";

//media
import ArrowUp from "../../assets/images/arrowUpGreen.svg";
import Order from "./subcomponent/order/order";
import api from "../../commons/api";
import Util from "../../commons/util/util";

const useStyles = makeStyles(
  (theme) => ({
    expand: {
      display: "flex",
      transform: "rotate(0deg)",
      marginLeft: "auto",
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

const MyBookings = (props) => {
  const classes = useStyles();
  const { state: flightState } = useContext(MyFlightsContext);
  const { state: authState } = useContext(AuthContext);
  const ClientCart = useContext(AppContext);
  const history = useHistory();
  const rootPath = useRouteMatch();

  const [parsedAccountId, setParsedAccountId] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const [isWebView, setIsWebView] = useState(Util.isWebView());
  const [isActiveOpen, setIsActiveOpen] = useState(true);
  const [isPastOpen, setIsPastOpen] = useState(false);

  const [activeBooking, setActiveBooking] = useState([]);
  const [activeBookingCount, setActiveBookingCount] = useState(0);

  //pastBookingsHooks
  const [pastBooking, setPastBooking] = useState([]);
  const [pastBookingCount, setPastBookingCount] = useState(0);
  const [pageNo, setPageNo] = useState(0);
  const [limit, setLimit] = useState(5);
  const [pastIsLoading, setPastIsLoading] = useState(true);
  const [pastError, setPastError] = useState(false);
  const [pastHasMore, setPastHasMore] = useState(false);

  const observer = useRef();
  const lastPastElement = useCallback(
    (node) => {
      if (pastIsLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pastHasMore) {
          setPageNo(pageNo + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [pastIsLoading, pastHasMore]
  );

  useEffect(() => {
    isWebView && sendDataToReactNative();
    const parsed = queryString.parse(props.location.search);
    setParsedAccountId(parsed.accountId);
    getActiveBookings();
  }, []);

  useEffect(() => {
    getPastBookings();
  }, [pageNo]);

  function getActiveBookings() {
    api
      .get(config.api.activeOrders)
      .then((data) => {
        if (data.type === "success" && data.status === 200) {
          const jsonData = data.data;
          setActiveBooking(jsonData);
          setActiveBookingCount(jsonData.length);
          setIsActiveOpen(true);
          setIsPastOpen(false);
          setIsLoading(false);
        } else {
          setIsActiveOpen(false);
          setIsPastOpen(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getPastBookings() {
    setPastIsLoading(true);
    setPastError(false);
    setPastHasMore(false);

    api
      .patch(config.api.pastOrders, {
        pageNo: pageNo,
        limit,
      })
      .then((data) => {
        if (data.data) {
          const response = data.data;
          setPastBookingCount(data.count && data.count[0].items);
          setPastBooking([...pastBooking, ...response]);
          setIsLoading(false);
          if (response.length) setPastHasMore(true);
          setPastIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setPastError(true);
      });
  }

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        "My Bookings" + "-" + ClientCart.isEmpty()
      );
  }

  function handleHeaderClick() {
    if (!activeBooking.length) {
      setIsPastOpen(!isPastOpen);
    } else if (!pastBooking.length) {
      setIsActiveOpen(!isActiveOpen);
    } else {
      setIsActiveOpen(!isActiveOpen);
      setIsPastOpen(!isPastOpen);
    }
  }

  return (
    <div className="myBookings-container">
      {isLoading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <div className="content-container">
          <div
            className={
              activeBooking.length
                ? "booking-header-wrapper"
                : "booking-header-wrapper disabled"
            }
            onClick={() => handleHeaderClick()}
          >
            <div className="booking-header">
              <h4 className="booking-header-text">{`Active Booking ${
                activeBookingCount ? "(" : ""
              } ${activeBookingCount ? activeBookingCount : ""} ${
                activeBookingCount ? ")" : ""
              }`}</h4>

              <div className="bookings-num-text">
                <div
                  className={clsx(classes.expand, {
                    [classes.expandOpen]: isActiveOpen,
                  })}
                  aria-expanded={isActiveOpen}
                  aria-label="show more active bookings"
                >
                  <img src={ArrowUp} alt="no image found" />
                </div>
              </div>
            </div>
          </div>
          {activeBooking.length && isActiveOpen ? (
            <div
              className={`booking-section ${
                isActiveOpen ? "booking-section-open" : null
              }`}
            >
              {activeBooking.map((orderItem, index) => (
                <Order
                  key={index}
                  orderItem={orderItem}
                  type="active"
                  orderQrCode={
                    orderItem.orderQrCode ? orderItem.orderQrCode : ""
                  }
                />
              ))}
            </div>
          ) : null}
          <div
            className={
              pastBooking.length
                ? "booking-header-wrapper"
                : "booking-header-wrapper disabled"
            }
            onClick={() => handleHeaderClick()}
          >
            <div className="booking-header">
              <div className="booking-header-text">Past Booking</div>
              <div className="bookings-num-text">
                <div
                  className={clsx(classes.expand, {
                    [classes.expandOpen]: isPastOpen,
                  })}
                  aria-expanded={isPastOpen}
                  aria-label="show more past bookings"
                >
                  <img src={ArrowUp} alt="no image found" />
                </div>
              </div>
            </div>
          </div>
          {(isPastOpen || !activeBooking.length) && pastBooking.length ? (
            <div className="booking-section">
              {pastBooking.map((orderItem, index) => (
                <Fragment key={index}>
                  {pastBooking.length === index + 1 ? (
                    <div ref={lastPastElement} className="last-element">
                      <Order
                        orderItem={orderItem}
                        type="active"
                        orderQrCode={
                          orderItem.orderQrCode ? orderItem.orderQrCode : ""
                        }
                      />
                      <div>{pastIsLoading && "Loading..."}</div>
                    </div>
                  ) : (
                    <Order
                      orderItem={orderItem}
                      type="past"
                      orderQrCode={
                        orderItem.orderQrCode ? orderItem.orderQrCode : ""
                      }
                    />
                  )}
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
