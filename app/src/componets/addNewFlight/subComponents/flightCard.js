import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import "../addNewFlight.css";
import moment from "moment";

//api
import config from "../../../commons/config";
import PushAlert from "../../../commons/notification";

import { Context as FlightContext } from "../../../context/FlightsContext";
import { Context as AuthContext } from "../../../context/AuthContext";

//icons
import DepartureSmall from "../../../assets/images/departureSmall.svg";
import LocationSmall from "../../../assets/images/locationSmall.svg";
import TimeSmall from "../../../assets/images/timeSmall.svg";
import PLusWhite from "../../../assets/images/plusWhite.svg";
import CheckIcon from "../../../assets/images/chek.svg";
import { NavLink } from "react-router-dom";
import api from "../../../commons/api";

import Modal from "react-bootstrap/Modal";
import Loader from "../../loader/loader";

const FlightCard = ({
  flightDetails,
  isWebView,
  flightAdded,
  handleTransitSwap,
  clearSearchInput,
  setClearSearchInput,
  setDestIsDisabled,
  isDestDisabled,
  intermediateSelectedFlight,
  setIntermediateSelectedFlight,
}) => {
  //context
  const { myFlights } = useContext(FlightContext);
  const { state: authState } = useContext(AuthContext);
  const history = useHistory();

  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [modalIsLoading, setModalIsLoading] = useState(false);

  function checkTransitFlight(accountId, flightUid, flightDetails) {
    if (
      flightDetails.bound_id &&
      (flightDetails.bound_id === "a" || flightDetails.bound_id === "A")
    ) {
      let arr = [];
      arr.push(flightDetails);
      setIntermediateSelectedFlight(arr);
      setModalIsVisible(true);
    } else if (isDestDisabled && intermediateSelectedFlight.length > 0) {
      addNewFlight(accountId, intermediateSelectedFlight[0].uid, flightUid);
    } else {
      addNewFlight(accountId, flightUid, "");
    }
  }

  function addTransitFlight() {
    setDestIsDisabled(true);
    setClearSearchInput(!clearSearchInput);
    setModalIsVisible(false);
    handleTransitSwap();
  }

  function addNewFlight(accountId, flightUid, connectingFlightUid) {
    if (moment(flightDetails.schedule_hour_id).isAfter(new Date())) {
      const apiURL = config.api.addNewFlight;
      api
        .post(apiURL, {
          accountId: isWebView ? accountId : `GUEST_USER`,
          flightUid,
          connectingFlightUid,
        })
        .then((response) => {
          if (response.status === "success") {
            PushAlert.success("Flight Added");
            history.push("/homepage");
          } else {
            PushAlert.error(
              "Oops! Something went wrong, please try again later"
            );
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      PushAlert.warning(
        "Please add upcoming flights to avail services offered"
      );
    }
  }

  return (
    <div className="flight-card-container">
      <div className="flight-card-container-content">
        <div className="card-logo-add">
          <div className="card-logo">
            <img
              src={config.url.serverURL + flightDetails.airline_img}
              className="flight-logo"
            />
          </div>
          {flightAdded === true ? (
            <img
              style={{
                width: "13px",
                height: "13px",
              }}
              src={CheckIcon}
            />
          ) : (
            <div
              className="card-add"
              onClick={() =>
                checkTransitFlight(
                  authState.accountID,
                  flightDetails.uid,
                  flightDetails
                )
              }
            >
              <img src={PLusWhite} />
            </div>
          )}
        </div>
        <div className="card-from-to">
          <div className="card-from-to-content">
            <span className="card-from-to-subtext">From</span>
            <span className="card-from-to-text">
              {flightDetails.base_airport_name}, {flightDetails.org_airport_id}
            </span>
          </div>
          <div className="card-from-to-content">
            <span className="card-from-to-subtext">To</span>
            <span className="card-from-to-text">
              {flightDetails.srcdest_airport_name},{" "}
              {flightDetails.dest_airport_id}
            </span>
          </div>
        </div>
        <div className="card-flight-time-terminal">
          <div className="card-flight-time-terminal-content">
            <img
              src={DepartureSmall}
              className="card-flight-time-terminal-image"
            ></img>
            <span className="card-flight-time-terminal-text">
              {flightDetails.flight_unique_no}
            </span>
          </div>
          <div className="card-flight-time-terminal-content">
            <img
              src={TimeSmall}
              className="card-flight-time-terminal-image"
            ></img>
            <span className="card-flight-time-terminal-text">
              {moment(flightDetails.schedule_hour_id).format("HH:mm")}
            </span>
          </div>
          <div className="card-flight-time-terminal-content">
            <img
              src={LocationSmall}
              className="card-flight-time-terminal-image"
            ></img>
            <span className="card-flight-time-terminal-text">
              {flightDetails.terminal}
            </span>
          </div>
        </div>
      </div>
      <Modal
        show={modalIsVisible}
        onHide={() => setModalIsVisible(false)}
        className="transit-flights-container"
      >
        <div className="transit-flights" id="content">
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
              <div
                className="addNewFlights"
                style={{
                  height: "auto",
                  overflowX: "auto",
                  backgroundColor: "#fff",
                }}
              >
                {intermediateSelectedFlight.map((item, index) => (
                  <FlightCard
                    key={index}
                    flightDetails={item}
                    isWebView={isWebView}
                    flightAdded={true}
                    handleTransitSwap={handleTransitSwap}
                    clearSearchInput={clearSearchInput}
                    setClearSearchInput={setClearSearchInput}
                    setDestIsDisabled={setDestIsDisabled}
                    isDestDisabled={isDestDisabled}
                    intermediateSelectedFlight={intermediateSelectedFlight}
                    setIntermediateSelectedFlight={
                      setIntermediateSelectedFlight
                    }
                  />
                ))}
              </div>
              <div
                className="action-buttons-container"
                style={{ width: "100%", marginTop: "1rem" }}
              >
                <div className="transit-submit-button-container">
                  <button
                    className="transit-submit-button"
                    onClick={() => {
                      if (intermediateSelectedFlight.length > 0) {
                        addNewFlight(
                          authState.accountID,
                          intermediateSelectedFlight[0].uid,
                          ""
                        );
                      }
                    }}
                  >
                    Continue
                  </button>
                </div>
                <div
                  style={{
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  or
                </div>
                <div className="transit-submit-button-container">
                  <button
                    className="transit-submit-button"
                    onClick={() => addTransitFlight()}
                  >
                    Add Connecting Flight
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FlightCard;
