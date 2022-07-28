import React, { useState, useEffect, useContext } from "react";

import "./addNewFlight.css";
import AppContext from "../../commons/context";

//apicall
import config from "../../commons/config";
import PushAlert from "../../commons/notification";

//components
import FilterHeader from "./subComponents/filterHeader";
import SearchField from "./subComponents/searchField";
import FlightCard from "./subComponents/flightCard";

//misc
import moment from "moment";

//icons
import Group from "../../assets/images/group.svg";
import IconChangeEnabled from "../../assets/images/iconChangeEnabled.svg";
import IconChangeDisabled from "../../assets/images/iconChangeDisabled.svg";
import IconNoFlightsAvailable from "../../assets/images/alert_no_flights.svg";
import api from "../../commons/api";
import Util from "../../commons/util/util";
import Loader from "../loader/loader";

const AddNewFlight = () => {
  const ClientCart = useContext(AppContext);
  const [baseAirport, setBaseAirport] = useState({ code: "", name: "" });
  const [flightSearchDestination, setFlightSearchDestination] = useState({
    code: "",
    name: "",
  });
  const [flightSearchSource, setFlightSearchSource] = useState({
    code: "",
    name: "",
  });
  const [flightSearchDate, setFlightSearchDate] = useState(new Date());
  const [flightData, setFlightData] = useState([]);
  const [isWebView] = useState(Util.isWebView());
  const [flightLoading, setFlightLoading] = useState(false);

  const [intermediateSelectedFlight, setIntermediateSelectedFlight] = useState(
    []
  );
  const [clearSearchInput, setClearSearchInput] = useState(false);
  const [isDestDisabled, setDestIsDisabled] = useState(false);

  useEffect(() => {
    sendDataToReactNative();
  }, []);

  useEffect(() => {
    if (flightSearchSource.code !== "" && flightSearchDestination.code !== "") {
      if (flightSearchSource.code === baseAirport.code) getFlightListing("dep");
      else if (flightSearchDestination.code === baseAirport.code)
        getFlightListing("arr");
      else {
        setFlightData([]);
        PushAlert.info("Base airport does not match source or destination");
      }
    }
  }, [flightSearchDestination, flightSearchSource, flightSearchDate]);

  useEffect(() => {
    if (baseAirport.code) {
      setFlightSearchSource(baseAirport);
      setFlightSearchDestination({ code: "", name: "" });
      if (flightSearchSource.code !== "" && flightSearchDestination.code !== "")
        getFlightListing("dep", baseAirport);
    }
  }, [baseAirport]);

  async function getFlightListing(boundId, baseAirport) {
    setFlightLoading(true);
    setFlightData([]);
    let flDate = moment(flightSearchDate).format("YYYYMMDD");
    let orgAirport = flightSearchSource;
    let destAirport = flightSearchDestination;

    if (baseAirport) {
      if (boundId === "dep") orgAirport = baseAirport;
      else destAirport = baseAirport;
    }

    const apiURL = config.api.flightListing;

    //this is hardcoded remove for correct api call
    // if (orgAirport.code === 'BLR') boundId = 'arr';
    // else boundId = 'dep';

    api
      .get(apiURL, {
        orgAirport: orgAirport.code,
        destAirport: destAirport.code,
        boundId,
        flDate,
      })
      .then((response) => {
        if (response.data) {
          const listResponse = response.data;
          if (boundId === "dep") {
            setFlightData(listResponse.dep);
          } else if (boundId === "arr") {
            listResponse.arr.forEach((item) => {
              let orgAirportName = item.base_airport_name;
              let destAirportName = item.srcdest_airport_name;
              item.srcdest_airport_name = orgAirportName;
              item.base_airport_name = destAirportName;
            });
            setFlightData(listResponse.arr);
          }
          setFlightLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        "Add New Flight" + "-" + ClientCart.isEmpty()
      );
  }

  function handleSwap() {
    const sourceName = flightSearchSource.name;
    const sourceCode = flightSearchSource.code;
    const destinationName = flightSearchDestination.name;
    const destinationCode = flightSearchDestination.code;
    setFlightSearchSource({ code: destinationCode, name: destinationName });
    setFlightSearchDestination({ code: sourceCode, name: sourceName });
  }

  function handleTransitSwap() {
    const destinationName = flightSearchDestination.name;
    const destinationCode = flightSearchDestination.code;
    setFlightSearchDestination({ code: "", name: "" });
    setFlightSearchSource({ code: destinationCode, name: destinationName });
  }

  return (
    <div className="addNewFlights">
      <FilterHeader
        flightSearchDate={flightSearchDate}
        setDate={setFlightSearchDate}
        setBaseAirport={setBaseAirport}
      />
      <div className="addNewFlights-search-wrapper">
        <div className="fromAndTo-wrapper">
          <div className="fromAndTo-design-container">
            <img src={Group} className="group-style" />
          </div>
          <div className="fromAndTo-content-wrapper">
            <SearchField
              subText={"from"}
              searchFieldName={flightSearchSource.name}
              setSearchField={setFlightSearchSource}
              placeholder={"Search flight departure"}
              setDestIsDisabled={setDestIsDisabled}
              isDestDisabled={isDestDisabled}
            />
            <SearchField
              subText={"to"}
              searchFieldName={flightSearchDestination.name}
              setSearchField={setFlightSearchDestination}
              placeholder={"Search flight arrival"}
              clearSearchInput={clearSearchInput}
              setClearSearchInput={setClearSearchInput}
            />
          </div>
          {flightSearchSource.code && flightSearchDestination.code ? (
            <div className="swapper-container">
              <div onClick={() => handleSwap()} aria-label="swap">
                <img src={IconChangeEnabled} height="28" width="28" />
              </div>
            </div>
          ) : (
            <div className="swapper-container">
              <img src={IconChangeDisabled} height="28" width="28" />
            </div>
          )}
        </div>
      </div>
      <div className="flight-listing-wrapper">
        <div className="flight-listing-header">
          {flightSearchSource.code &&
          flightSearchDestination.code &&
          flightData.length
            ? `Flights Found ${
                flightData.length > 2 ? `(${flightData.length})` : ""
              }`
            : flightData.length
            ? `All Available Flights ${
                flightData.length > 2 ? `(${flightData.length})` : ""
              }`
            : "Search for flights!"}
        </div>
        <div className="flight-listing-content">
          {flightLoading ? (
            <div
              style={{
                display: "flex",
                flex: "1 1 0%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                margin: "5rem auto",
              }}
            >
              <Loader />
            </div>
          ) : flightData.length === 0 &&
            flightSearchSource.code !== "" &&
            flightSearchDestination.code !== "" ? (
            <div style={{ margin: "5rem auto" }}>
              <img src={IconNoFlightsAvailable} />
              <span>No Flights Available</span>
            </div>
          ) : (
            flightData.map((item, index) => (
              <FlightCard
                key={index}
                flightDetails={item}
                isWebView={isWebView}
                handleTransitSwap={handleTransitSwap}
                clearSearchInput={clearSearchInput}
                setClearSearchInput={setClearSearchInput}
                setDestIsDisabled={setDestIsDisabled}
                isDestDisabled={isDestDisabled}
                intermediateSelectedFlight={intermediateSelectedFlight}
                setIntermediateSelectedFlight={setIntermediateSelectedFlight}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddNewFlight;
