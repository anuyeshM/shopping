import React, { useState, useEffect, useContext, useMemo } from "react";
import { useRouteMatch, useHistory, useParams } from "react-router-dom";
import { DateTimePicker } from "@material-ui/pickers";

//misc
import moment from "moment";
import Loader from "../../loader/loader";
import PushAlert from "../../../commons/notification";
import config from "../../../commons/config";
import Header from "../../header/headerComponent";
import Modal from "react-bootstrap/Modal";
import OptionCard from "../subcomponent/detailsOptionCard";
import "./serviceDetail.css";
import QuantityCounter from "./subcomponent/quantityCounter";
import Checkbox from "../subcomponent/checkbox";
import AppContext from "../../../commons/context";
import { Context as MyFlightsContext } from "../../../context/FlightsContext";
import { Context as AuthContext } from "../../../context/AuthContext";
import $ from "jquery";
import api from "../../../commons/api";
import Util from "../../../commons/util/util";

const ServiceDetail = (props) => {
  const history = useHistory();
  const rootPath = useRouteMatch();
  const params = useParams();
  let pid = params.serviceId || props.location.state.id;
  const daysList = useMemo(() => config.days, []);
  const hoursList = useMemo(() => config.hours, []);
  const minutesList = useMemo(() => config.minutes, []);
  const ClientCart = useContext(AppContext);
  const { state: flightState } = useContext(MyFlightsContext);
  const { state: authState } = useContext(AuthContext);
  const [isWebView, setIsWebView] = useState(Util.isWebView());
  const [isLoading, setIsLoading] = useState(true);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [modalIsLoading, setModalIsLoading] = useState(true);
  const [serviceInfo, setServiceInfo] = useState({});
  const [isAdded, setIsAdded] = useState(false);
  const [baggageInsurance, setBaggageInsurance] = useState(false);
  const [flightData, setFlightData] = useState(flightState.flightData);
  // const defaultSelectedFlight = (flightData[0]) ? flightData[0].flightId : '';
  const defaultSelectedFlight = props.location.state
    ? props.location.state.selectedFlightId
    : flightData[0]
    ? flightData[0].flightId
    : "";
  const defaultSelectedFlightUID = props.location.state
    ? props.location.state.selectedFlightUID
    : flightData[0]
    ? flightData[0].UID
    : "";
  const [selected, setSelected] = useState(defaultSelectedFlight);
  const [selectedUID, setSelectedUID] = useState(defaultSelectedFlightUID);
  const [leadTime, setLeadTime] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [maxArrivalDate, setMaxArrivalDate] = useState(null);
  const [maxArrivalTime, setMaxArrivalTime] = useState(null);
  const [counterValue, setCounterValue] = useState(1);
  const [counterStartValue, setCounterStartValue] = useState(1);
  const [counterType, setCounterType] = useState("");
  const [maxCounterValue, setMaxCounterValue] = useState();
  const [counterStepValue, setCounterStepValue] = useState();
  const [details, setDetails] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [qtyDrivenFields, setQtyDrivenFields] = useState();
  const [addOns, setAddOns] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    id: "",
    price: "",
    currency: "",
    title: "",
    discountPercent: "",
  });
  const [isDataPreFilled, setIsDataPreFilled] = useState(false);
  const refItemQuantity =
    props.location.state && props.location.state.itemQty
      ? +props.location.state.itemQty
      : 1;

  useEffect(() => {
    getDetails();
  }, [selected, arrivalTime]);

  useEffect(() => {
    if (!isDataPreFilled) preFillAddedItems();
  }, []);

  useEffect(() => {
    setCounterValue(counterStartValue);
  }, [selectedOption]);

  function sendDataToReactNative(data) {
    let rnData = data ? data : metaData;
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        rnData && Object.values(rnData).length > 0
          ? rnData.title + "-" + ClientCart.isEmpty()
          : "" + "-" + ClientCart.isEmpty()
      );
  }

  const preFillAddedItems = () => {
    let cart = ClientCart.getCart();
    if (cart[pid] && cart[pid].items.length > 0) {
      if (
        cart[pid].items[0].length > 0 &&
        cart[pid].items[0].flightUid &&
        cart[pid].items[0].flightUid !== undefined &&
        cart[pid].items[0].flightUid === selectedUID
      ) {
        setSelectedUID(cart[pid].items[0].flightUid);
      }
      if (
        cart[pid].items[0].length > 0 &&
        cart[pid].items[0].flightId &&
        cart[pid].items[0].flightId !== undefined &&
        cart[pid].items[0].flightId === selected
      ) {
        setSelected(cart[pid].items[0].flightId);
      }
      if (
        cart[pid].items[0].length > 0 &&
        cart[pid].items[0].flightUid &&
        cart[pid].items[0].flightUid !== undefined &&
        cart[pid].items[0].flightUid === selectedUID
      ) {
        setArrivalTime(
          moment(cart[pid].items[0].serviceDateTime, "YYYY-MM-DD HH:mm:ss")
        );
      }
      setIsDataPreFilled(true);
    }
  };

  const getDetails = async () => {
    try {
      let flightDate = "";
      if (flightState.flightData.length > 0) {
        flightState.flightData.forEach((item) => {
          if (item.UID === selectedUID) {
            flightDate = item.scheduleDate;
          }
        });
      } else {
        flightDate = moment(new Date()).format("YYYY-MM-DD");
      }
      let apiURL = `${
        config.api.serviceVariants
      }?serviceId=${pid}&serviceDate=${
        arrivalTime == null
          ? moment(flightDate).format("YYYY-MM-DD")
          : moment(arrivalTime).format("YYYY-MM-DD")
      }`;
      let apiResponse = await api.get(apiURL);
      let regResponse = apiResponse;
      if (regResponse.status === 200) {
        if (regResponse.data.length > 0) {
          regResponse.data.forEach(function (element, index) {
            const itemParam = {
              storecode: pid,
              productId: element._id,
              flightUid: selectedUID,
            };
            if (ClientCart.hasService(itemParam)) element.isAdded = true;
            else element.isAdded = false;
            element.selectedFlag = false;
            if (details.length > 0) {
              if (element._id === selectedOption.id) {
                element.selectedFlag = true;
              }
            }
            if (element.leadTimeToBook)
              setLeadTime(element.leadTimeToBook / 60);
            if (index === 0) {
              if (details.length === 0) element.selectedFlag = true;
              let unitOfMeasure = [];
              element.uom.forEach((x) => {
                if (
                  (x.activeFlag === "Y" || x.activeFlag === "y") &&
                  (x.primaryFlag === "Y" || x.primaryFlag === "y")
                ) {
                  if (ClientCart.hasService(itemParam)) {
                    let item = ClientCart.getItem(itemParam);
                    if (item && item.itemQuantity) {
                      setCounterValue(item.itemQuantity);
                    }
                  }
                  setCounterValue(x.startValue);
                  setCounterStartValue(x.startValue);
                  setCounterStepValue(x.endValue);
                  setMaxCounterValue(x.maxValue);
                  setCounterType(x.qtyType);
                  unitOfMeasure.push(x);
                }
              });
              setQtyDrivenFields(unitOfMeasure);
              element.addonServices.forEach((y) => {
                y.quantity = 0;
              });
              setAddOns(element.addonServices);
              if (details.length === 0) {
                setSelectedOption({
                  ...selectedOption,
                  id: element._id,
                  price: element.pricing[0].latestGrossPrice[0].grossPrice,
                  currency: element.pricing[0].currency,
                  title: element.title,
                  discountPercent: element.discount_perc,
                });
              }
            }
          });
          setDetails(regResponse.data);
          setMetaData(regResponse.metadata);
          let arrDateTime = "";
          if (flightData.length > 0) {
            flightData.forEach((element) => {
              if (element.UID === selectedUID) {
                if (element.sector === "I") {
                  arrDateTime = moment(
                    element.scheduleDateTime.toString().slice(0, -2),
                    "YYYYMMDDHHmm"
                  ).subtract(3, "h");
                } else {
                  arrDateTime = moment(
                    element.scheduleDateTime.toString().slice(0, -2),
                    "YYYYMMDDHHmm"
                  ).subtract(2, "h");
                }
                setMaxArrivalDate(element.scheduleDate);
                setMaxArrivalTime(
                  moment(element.scheduleDateTime, "YYYYMMDDHHmm")
                );
                // setArrivalTime(arrDateTime);
              }
            });
          }
          sendDataToReactNative(regResponse.metadata);
          setIsLoading(false);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  function getFlightInformation() {
    if (flightState.flightData.length > 0) {
      return flightState.flightData.map((item, index) => {
        if (item.UID === selectedUID) {
          return (
            <p key={index} className="flight-select-info">
              Flight {item.flightId} {item.baseAirport} - {item.srcDestAirport}{" "}
              {item.terminal} {item.scheduleDate.slice(8, 10)}
              {"-"}
              {item.scheduleDate.slice(5, 7)}
              {"-"}
              {item.scheduleDate.slice(0, 4)} {item.scheduleTime.slice(0, 5)}
            </p>
          );
        }
      });
    }
    return <p />;
  }

  const addCartEvent = (event) => {
    // let selectedFlightUID = "";
    // let selectedFlightDate = "";
    let currQty = 1;
    if (counterValue !== undefined) {
      currQty = counterValue;
    }

    // flightData.forEach((element) => {
    //   if (element.UID === selectedUID) {
    //     selectedFlightUID = element.UID;
    //     selectedFlightDate = element.scheduleDate;
    //   }
    // });

    let selectedAddOns = [];
    addOns.forEach((x) => {
      if (x.quantity > 0) {
        selectedAddOns.push({
          addonId: x._id,
          imageUrl: "",
          quantity: x.quantity,
          type: x.servicename ? x.servicename : "",
          unitPrice:
            x.pricing.length > 0
              ? x.pricing[0].latestGrossPrice[0].grossPrice
              : 0,
        });
      }
    });

    let subData = details;
    for (let data of subData) {
      if (data._id == selectedOption.id) {
        data.isAdded = data.isAdded == null ? true : !data.isAdded;
      }
    }
    setDetails([...subData]);

    const $root = $(document);
    const itemId = selectedOption.id;
    // const itemPrice = selectedOption.price * currQty;
    const itemPrice = getFinalPrice();
    const itemLabel = selectedOption ? selectedOption.title : "";
    const itemQuantity = currQty;
    const maxQuantity = 5;
    const itemType = "service";
    const flightId = selected;
    const flightUid = selectedUID;
    const serviceDate = moment(arrivalTime).format("YYYY-MM-DD");
    const serviceDateTime =
      moment(arrivalTime).format("YYYY-MM-DD HH:mm") + ":00";
    // const serviceDate = "09-May-2022";
    const addOn = selectedAddOns;

    //   console.log("Add to cart", selected);
    //   console.log("Add to cart", selectedFlightUID);

    if (!getVariantAddedStatus()) {
      const removeParam = {
        storecode: pid,
        storename:
          props.location.state !== undefined ? props.location.state.title : "",
        productId: itemId,
      };
      ClientCart.removeItem(removeParam);
      PushAlert.success("Item removed from cart");
      setIsAdded(!isAdded);
      sendDataToReactNative(metaData);
    } else {
      const addParam = {
        storecode: pid,
        storename:
          props.location.state !== undefined ? props.location.state.title : "",
        item: {
          itemId,
          itemLabel,
          itemPrice,
          itemQuantity,
          maxQuantity,
          itemType,
          flightId,
          flightUid,
          serviceDate,
          serviceDateTime,
          addOn,
        },
      };

      if (ClientCart.addItem(addParam)) {
        PushAlert.success("Item successfully added to cart");
        setIsAdded(!isAdded);
        sendDataToReactNative(metaData);
        //   history.push({
        //     pathname: `/premiumServices`,
        // });
        // history.goBack();
      }
    }
    console.log(ClientCart.getCart());

    if (ClientCart.isEmpty()) {
      $root.find('[data-id="headerCart"]').addClass("header-cart-empty");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-filled");
    } else {
      $root.find('[data-id="headerCart"]').addClass("header-cart-filled");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-empty");
    }
  };

  function handleAddOnDecrement(id) {
    let subData = addOns;
    for (let data of subData) {
      if (data.addonServiceSKU == id && data.quantity > 0) {
        let found = data.uom.find(
          (element) =>
            element.primaryFlag === "Y" || element.primaryFlag === "y"
        );
        let decrementValue = found ? found.endValue : 1;
        data.quantity =
          data.quantity - decrementValue < 0
            ? 0
            : data.quantity - decrementValue;
        break;
      }
    }
    setAddOns([...subData]);

    let selectedAddOns = [];
    addOns.forEach((x) => {
      if (x.quantity > 0) {
        selectedAddOns.push(x);
      }
    });
    const updateParam = {
      storecode: pid,
      productId: selectedOption.id,
      addOn: selectedAddOns,
    };
    ClientCart.updateSelectedAddon(updateParam);
  }

  function handleAddOnIncrement(id) {
    let subData = addOns;
    for (let data of subData) {
      if (data.addonServiceSKU == id) {
        let found = data.uom.find(
          (element) =>
            element.primaryFlag === "Y" || element.primaryFlag === "y"
        );
        let maxQty = found ? found.maxValue : 10;
        let incrementValue = found ? found.endValue : 1;
        if (data.quantity < maxQty)
          data.quantity = data.quantity + incrementValue;
        else PushAlert.warning(`Maximum Addon Quantity Limit Reached`);
        break;
      }
    }
    setAddOns([...subData]);

    let selectedAddOns = [];
    addOns.forEach((x) => {
      if (x.quantity > 0) {
        selectedAddOns.push(x);
      }
    });
    const updateParam = {
      storecode: pid,
      productId: selectedOption.id,
      addOn: selectedAddOns,
    };
    ClientCart.updateSelectedAddon(updateParam);
  }

  function handleQtyInput(e, id) {
    let subData = addOns;
    for (let data of subData) {
      if (data.addonServiceSKU == id) {
        let found = data.uom.find(
          (element) =>
            element.primaryFlag === "Y" || element.primaryFlag === "y"
        );
        let maxQty = found ? found.maxValue : 10;
        if (e.target.value >= 0) {
          if (e.target.value <= maxQty) {
            data.quantity = parseInt(e.target.value);
          } else {
            PushAlert.warning(`Maximum Addon Quantity Limit Reached`);
          }
        }
        break;
      }
    }
    setAddOns([...subData]);

    let selectedAddOns = [];
    addOns.forEach((x) => {
      if (x.quantity > 0) {
        selectedAddOns.push(x);
      }
    });
    const updateParam = {
      storecode: pid,
      productId: selectedOption.id,
      addOn: selectedAddOns,
    };
    ClientCart.updateSelectedAddon(updateParam);
  }

  function getAddOnQtyType(id) {
    let subData = addOns;
    for (let data of subData) {
      if (data.addonServiceSKU == id) {
        let found = data.uom.find(
          (element) =>
            element.primaryFlag === "Y" || element.primaryFlag === "y"
        );
        if (found) {
          return found.qtyType === "counter";
        } else {
          return false;
        }
      }
    }
  }

  const getAddOnsApplicableFor = (item) => {
    if (item.uom.length > 0) {
      let found = item.uom.find(
        (ele) => ele.primaryFlag === "Y" || ele.primaryFlag === "y"
      );
      if (found) {
        if (found.qtyType === "step")
          return " / " + found.endValue + " " + found.type;
        else return " / " + found.type;
      } else {
        return "";
      }
    }
  };

  const getFinalPrice = () => {
    let finalPrice = 0;
    const parentServiceQty = parseFloat(counterValue);
    let parentServicePrice;
    if (counterType === "step") {
      parentServicePrice = parseFloat(
        (selectedOption.price * parentServiceQty) / counterStepValue
      );
    } else {
      parentServicePrice = parseFloat(selectedOption.price * parentServiceQty);
    }
    let addOnPrice = 0;
    addOns.forEach((x) => {
      if (x.quantity > 0) {
        if (x.uomQtyMappingFlag === "Y" || x.uomQtyMappingFlag === "y") {
          let addOnBasePrice =
            x.pricing.length > 0
              ? x.pricing[0].latestGrossPrice[0].grossPrice
              : 0;
          addOnPrice = parseFloat(
            addOnPrice + addOnBasePrice * x.quantity * parentServiceQty
          );
        } else {
          let addOnBasePrice =
            x.pricing.length > 0
              ? x.pricing[0].latestGrossPrice[0].grossPrice
              : 0;
          addOnPrice = parseFloat(addOnPrice + addOnBasePrice * x.quantity);
        }
      }
    });
    finalPrice = parseFloat(finalPrice + parentServicePrice + addOnPrice);
    return finalPrice;
  };

  const getVariantAddedStatus = () => {
    if (details.length > 0) {
      let found = details.find((ele) => ele._id === selectedOption.id);
      if (found) {
        return found.isAdded;
      } else {
        return false;
      }
    }
  };

  const getUomDesc = () => {
    if (serviceInfo.uom.length > 0) {
      let found = serviceInfo.uom.find(
        (ele) => ele.primaryFlag === "Y" || ele.primaryFlag === "y"
      );
      if (found) {
        return found.uomDesc && found.uomDesc.length > 80
          ? found.uomDesc.substring(0, 80) + "..."
          : found.uomDesc;
      } else {
        return "";
      }
    }
  };

  const getSelectedFlightMovementType = () => {
    if (flightData.length > 0) {
      let found = flightData.find((ele) => ele.UID === selectedUID);
      if (found) {
        return found.movementType;
      } else {
        return "";
      }
    }
  };
  const renderTimePicker = () => {
    if (
      metaData.serviceFlightMapping !== undefined &&
      (metaData.serviceFlightMapping === "Y" ||
        metaData.serviceFlightMapping === "y")
    ) {
      if (getSelectedFlightMovementType() === "D") {
        return (
          <DateTimePicker
            value={arrivalTime}
            onChange={(newValue) => {
              const minTime = moment(new Date());
              let leadTimeLocal =
                leadTime === null
                  ? null
                  : moment(new Date()).add(leadTime, "hours");
              const maxTime = maxArrivalTime;
              if (minTime.isBefore(newValue)) {
                if (leadTimeLocal !== null) {
                  if (leadTimeLocal.isBefore(newValue)) {
                    if (maxTime !== null && maxTime.isAfter(newValue)) {
                      setArrivalTime(newValue);
                    } else {
                      PushAlert.warning("Cannot select beyond flight time");
                    }
                  } else {
                    PushAlert.warning(
                      `This service has a lead time of ${leadTime} hours`
                    );
                  }
                } else {
                  if (maxTime.isAfter(newValue)) {
                    setArrivalTime(newValue);
                  } else {
                    PushAlert.warning("Cannot select beyond flight time");
                  }
                }
              } else {
                PushAlert.warning("Cannot select past time");
              }
            }}
            ampm={false}
            minDate={
              leadTime === null
                ? new Date()
                : moment(new Date()).add(leadTime, "hours")
            }
            maxDate={moment(maxArrivalDate)}
            format="DD-MM-YYYY HH:mm"
            emptyLabel="Select Date and Time"
          />
        );
      } else if (getSelectedFlightMovementType() === "A") {
        return (
          <DateTimePicker
            value={arrivalTime}
            onChange={(newValue) => {
              let leadTimeLocal =
                leadTime === null
                  ? null
                  : moment(new Date()).add(leadTime, "hours");
              if (maxArrivalTime.isBefore(newValue)) {
                if (leadTimeLocal !== null) {
                  if (leadTimeLocal.isBefore(newValue)) {
                    setArrivalTime(newValue);
                  } else {
                    PushAlert.warning(
                      `This service has a lead time of ${leadTime} hours`
                    );
                  }
                } else {
                  setArrivalTime(newValue);
                }
              } else {
                PushAlert.warning(
                  "Cannot select past time or before flight arrival time"
                );
              }
            }}
            ampm={false}
            minDate={
              leadTime === null
                ? moment(maxArrivalDate, "YYYY-MM-DD").subtract(1, "days")
                : moment(maxArrivalDate, "YYYY-MM-DD")
                    .subtract(1, "days")
                    .add(leadTime, "hours")
            }
            format="DD-MM-YYYY HH:mm"
            emptyLabel="Select Date and Time"
          />
        );
      }
    } else {
      return (
        <DateTimePicker
          value={arrivalTime}
          onChange={(newValue) => {
            const minTime = moment(new Date());
            let leadTimeLocal =
              leadTime === null
                ? null
                : moment(new Date()).add(leadTime, "hours");
            if (minTime.isBefore(newValue)) {
              if (leadTimeLocal !== null) {
                if (leadTimeLocal.isBefore(newValue)) {
                  setArrivalTime(newValue);
                } else {
                  PushAlert.warning(
                    `This service has a lead time of ${leadTime} hours`
                  );
                }
              } else {
                setArrivalTime(newValue);
              }
            } else {
              PushAlert.warning("Cannot select past time");
            }
          }}
          ampm={false}
          minDate={
            leadTime === null
              ? new Date()
              : moment(new Date()).add(leadTime, "hours")
          }
          format="DD-MM-YYYY HH:mm"
          emptyLabel="Select Date and Time"
        />
      );
    }
  };

  return (
    <div className="details-container">
      {modalIsVisible ? null : isWebView ? null : (
        <Header
          gobackEnabled={true}
          showScanner={true}
          showCart={true}
          staticHeaderText={true}
          gobackLinkRef=""
          headerText={metaData.title ? metaData.title : ""}
          headerTextLinkRef={""}
          storecode={""}
          rootPath={rootPath.url}
        />
      )}
      {isLoading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <div className="wrapper">
          <div
            className={
              isWebView ? "content-webview-container" : "content-container"
            }
          >
            {flightState.flightData.length > 0 ? (
              <div className="flight-select-container">
                {getFlightInformation()}
              </div>
            ) : null}
            <div className="detail-option-container">
              <p className="option-label">Choose Option</p>
              <div
                className="option-card-container"
                style={details.length === 1 ? { overflowX: "hidden" } : {}}
              >
                <div
                  className="horizontal-scroll-classification"
                  style={{
                    gridTemplateColumns: "auto auto auto auto",
                    gridTemplateColumns: `repeat(${Math.max(
                      3,
                      details.length
                    )}, 13rem)`,
                  }}
                >
                  {details.map((item, index) => (
                    <OptionCard
                      key={item._id}
                      modalIsVisible={modalIsVisible}
                      setModalIsVisible={setModalIsVisible}
                      setModalIsLoading={setModalIsLoading}
                      setServiceInfo={setServiceInfo}
                      item={item}
                      details={details}
                      setDetails={setDetails}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
                      ancestorId={pid}
                      counterValue={counterValue}
                      setCounterValue={setCounterValue}
                      counterStartValue={counterStartValue}
                      setCounterStartValue={setCounterStartValue}
                      maxCounterValue={maxCounterValue}
                      setMaxCounterValue={setMaxCounterValue}
                      counterStepValue={counterStepValue}
                      setCounterStepValue={setCounterStepValue}
                      setCounterType={setCounterType}
                      setQtyDrivenFields={setQtyDrivenFields}
                      setAddOns={setAddOns}
                      setArrivalTime={setArrivalTime}
                      sendDataToReactNative={sendDataToReactNative}
                      selectedFlightUID={selectedUID}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="user-input-container">
              <div className="time-picker-container">
                <p className="time-picker-label">
                  Expected service start time &ensp;
                  <span style={{ color: "red" }}>*</span>
                </p>
                <div className="time-picker">
                  {renderTimePicker()}
                  {/* {metaData.serviceFlightMapping !== undefined &&
                  (metaData.serviceFlightMapping === "Y" ||
                    metaData.serviceFlightMapping === "y") ? (
                    <DateTimePicker
                      value={arrivalTime}
                      onChange={(newValue) => {
                        const minTime = moment(new Date());
                        let leadTimeLocal =
                          leadTime === null
                            ? null
                            : moment(new Date()).add(leadTime, "hours");
                        const maxTime = maxArrivalTime;
                        if (minTime.isBefore(newValue)) {
                          if (leadTimeLocal !== null) {
                            if (leadTimeLocal.isBefore(newValue)) {
                              if (
                                maxTime !== null &&
                                maxTime.isAfter(newValue)
                              ) {
                                setArrivalTime(newValue);
                              } else {
                                PushAlert.warning(
                                  "Cannot select beyond flight time"
                                );
                              }
                            } else {
                              PushAlert.warning(
                                `This service has a lead time of ${leadTime} hours`
                              );
                            }
                          } else {
                            if (maxTime.isAfter(newValue)) {
                              setArrivalTime(newValue);
                            } else {
                              PushAlert.warning(
                                "Cannot select beyond flight time"
                              );
                            }
                          }
                        } else {
                          PushAlert.warning("Cannot select past time");
                        }
                      }}
                      ampm={false}
                      minDate={
                        leadTime === null
                          ? new Date()
                          : moment(new Date()).add(leadTime, "hours")
                      }
                      maxDate={moment(maxArrivalDate)}
                      format="DD-MM-YYYY HH:mm"
                      emptyLabel="Select Date and Time"
                    />
                  ) : (
                    <DateTimePicker
                      value={arrivalTime}
                      onChange={(newValue) => {
                        const minTime = moment(new Date());
                        let leadTimeLocal =
                          leadTime === null
                            ? null
                            : moment(new Date()).add(leadTime, "hours");
                        if (minTime.isBefore(newValue)) {
                          if (leadTimeLocal !== null) {
                            if (leadTimeLocal.isBefore(newValue)) {
                              setArrivalTime(newValue);
                            } else {
                              PushAlert.warning(
                                `This service has a lead time of ${leadTime} hours`
                              );
                            }
                          }
                        } else {
                          PushAlert.warning("Cannot select past time");
                        }
                      }}
                      ampm={false}
                      minDate={
                        leadTime === null
                          ? new Date()
                          : moment(new Date()).add(leadTime, "hours")
                      }
                      format="DD-MM-YYYY HH:mm"
                      emptyLabel="Select Date and Time"
                    />
                  )} */}
                </div>
              </div>
              {qtyDrivenFields.map((item, index) => (
                <div
                  key={index}
                  style={{
                    width: "100%",
                    height: "100%",
                    marginBottom: "2rem",
                  }}
                >
                  <QuantityCounter
                    key={index}
                    value={item.frontendLabel}
                    index={index}
                    counterValue={counterValue}
                    setCounterValue={setCounterValue}
                    counterStartValue={counterStartValue}
                    maxCounterValue={maxCounterValue}
                    counterStepValue={counterStepValue}
                    selectedVariant={selectedOption}
                    pid={pid}
                    props={props}
                    isDataPreFilled={isDataPreFilled}
                    selectedOption={selectedOption}
                    selectedFlightUID={selectedUID}
                  />
                </div>
              ))}
              {addOns.length > 0 ? (
                <div style={{ width: "100%", marginBottom: "10px" }}>
                  <div className="add-on-text">Add On:</div>
                  {addOns.map((item, index) => (
                    <div key={index} className="add-on-item-container">
                      <div className="add-on-item-text">
                        {item.servicename ? item.servicename : ""}
                      </div>
                      <div className="addon-quantity-row-container">
                        <div className="add-on-input-container">
                          <input
                            type="number"
                            value={item.quantity}
                            className="add-on-input"
                            onChange={(e) =>
                              handleQtyInput(e, item.addonServiceSKU)
                            }
                            readOnly={
                              getAddOnQtyType(item.addonServiceSKU)
                                ? false
                                : true
                            }
                          />
                        </div>
                        <div className="add-on-button-container">
                          <button
                            className="add-on-decrement-button"
                            onClick={() =>
                              handleAddOnDecrement(item.addonServiceSKU)
                            }
                          >
                            <img
                              src={require("../../../assets/images/minus.svg")}
                              alt="minus"
                              height={10}
                              width={10}
                            />
                          </button>
                          <button
                            className="add-on-increment-button"
                            onClick={() =>
                              handleAddOnIncrement(item.addonServiceSKU)
                            }
                          >
                            <img
                              src={require("../../../assets/images/plus.svg")}
                              height={10}
                              width={10}
                              alt="plus"
                            />
                          </button>
                        </div>
                        <div className="add-on-item-price-text">
                          {item.pricing &&
                            item.pricing.length > 0 &&
                            item.pricing[0].currency}{" "}
                          {item.pricing &&
                            item.pricing.length > 0 &&
                            item.pricing[0].latestGrossPrice[0].grossPrice.toLocaleString()}
                          <span
                            style={{ fontSize: "16px", textTransform: "none" }}
                          >
                            {getAddOnsApplicableFor(item)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="submit-button-container">
            <button
              className={
                selectedOption.id === "" || arrivalTime === null
                  ? "submit-button disabled"
                  : "submit-button"
              }
              onClick={addCartEvent}
              disabled={selectedOption.id === "" || arrivalTime === null}
            >
              {getVariantAddedStatus()
                ? "Remove Item"
                : `Add to Cart ${
                    selectedOption.price
                      ? `- ${selectedOption.currency} ` +
                        getFinalPrice().toLocaleString("en", {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })
                      : ""
                  }`}
            </button>
          </div>
        </div>
      )}
      <Modal
        show={modalIsVisible}
        onHide={() => setModalIsVisible(false)}
        className="service-information-container"
      >
        <div className="service-information" id="content">
          {modalIsLoading ? (
            <div className="modal-loader-container">
              <Loader />
            </div>
          ) : (
            <div className="modal-content-container">
              <button
                className="modal-close-line-container"
                draggable={true}
                onClick={() => setModalIsVisible(false)}
                onTouchEnd={() => setModalIsVisible(false)}
              >
                <span className="modal-close-line"></span>
              </button>
              <div className="modal-title-container">
                <img
                  src={require("../../../assets/images/arrowLeft.svg")}
                  alt="la"
                  width="20"
                  height="20"
                  onClick={() => setModalIsVisible(false)}
                />
                <div className="modal-title">{serviceInfo.title}</div>
              </div>
              <div className="modal-desc-container">
                <div className="modal-desc">{serviceInfo.description}</div>
              </div>
              <div className="card-slider-container">
                <div
                  className="horz-scroll-category"
                  style={{
                    gridTemplateColumns: `repeat(
                                        ${
                                          Object.values(
                                            serviceInfo.serviceImageUrlSub
                                          ).length
                                        }, 
                                        ${
                                          1 ===
                                          Object.values(
                                            serviceInfo.serviceImageUrlSub
                                          ).length
                                            ? "90vw"
                                            : "18rem"
                                        }
                                    )`,
                  }}
                >
                  {serviceInfo.serviceImageUrlSub instanceof Array ? (
                    Object.values(serviceInfo.serviceImageUrlSub).map(
                      (item, index) => (
                        <div className="card-slider" key={index}>
                          <img
                            src={item}
                            alt="Oops, no image!!"
                            className="slider-image"
                            width="280"
                            height="150"
                          />
                        </div>
                      )
                    )
                  ) : (
                    <div className="card-slider">
                      <img
                        src={serviceInfo.serviceImageUrlSub}
                        alt="Oops, no image!!"
                        className="slider-image"
                        width="280"
                        height="150"
                      />
                    </div>
                  )}
                </div>
              </div>
              {serviceInfo.uom && serviceInfo.uom.length > 0 ? (
                <div className="promotion-container">
                  <span className="modal-features-title">Inclusions: </span>
                  <span className="promotion">{getUomDesc()}</span>
                </div>
              ) : null}
              <div className="modal-features-container">
                {serviceInfo.title && serviceInfo.title !== "" ? (
                  <span className="modal-features-title">
                    {serviceInfo.title}:
                  </span>
                ) : null}
                {serviceInfo.features &&
                  serviceInfo.features.map((item, index) =>
                    item.featureName ? (
                      <span className="modal-features" key={index}>
                        <img
                          src={require("../../../assets/images/chek.svg")}
                          style={{
                            width: "13px",
                            height: "13px",
                            paddingRight: "7px",
                          }}
                        />
                        {item.featureName}
                      </span>
                    ) : null
                  )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetail;
