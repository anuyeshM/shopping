import React, { useState, useContext, useRef } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { Context as FlightContext } from "../../../context/FlightsContext";
import { Context as AuthContext } from "../../../context/AuthContext";
import AppContext from "../../../commons/context";

//components
import UseOutsideClick from "../../../commons/useOutsideClick";

//images
import DepartureSmall from "../../../assets/images/departureSmall.svg";
import LocationSmall from "../../../assets/images/locationSmall.svg";
import CalendarSmallBlack from "../../../assets/images/calendarSmallBlack.svg";
import MenuIcon from "../../../assets/images/iconMenu.svg";
import Navigation from "../../../assets/images/navigation.svg";
import Tasks from "../../../assets/images/tasks.svg";
import Delete from "../../../assets/images/delete.svg";
import CheckIn from "../../../assets/images/checkIn.svg";

//api
import config from "../../../commons/config";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useTheme, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";

const FlightCard = ({
  flightData,
  triggerState,
  triggerSetter,
  isWebView,
  caller,
}) => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const ref = useRef();
  const ClientCart = useContext(AppContext);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  //context
  const { removeFlight } = useContext(FlightContext);
  const { state: authState } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });

  function checkIfServiceMapped() {
    let showPopUp = false;
    let cartObject = ClientCart.getCart();
    Object.values(cartObject).forEach((x) => {
      x.items.forEach((citem) => {
        if (citem.flightUid === flightData.UID) {
          showPopUp = true;
        }
      });
    });
    if (showPopUp) {
      handleClickOpen();
    } else {
      if (isWebView) removeFlight(authState.accountID, flightData.UID);
      else removeFlight("GUEST_USER", flightData.UID);
      setTimeout(() => {
        triggerSetter(!triggerState);
        handleClose();
      }, 1000);
    }
  }

  function handleRemoveFlight() {
    let cartObject = ClientCart.getCart();
    Object.values(cartObject).forEach((x) => {
      x.items = x.items.filter((citem) => citem.flightUid !== flightData.UID);
    });

    if (isWebView) removeFlight(authState.accountID, flightData.UID);
    else removeFlight("GUEST_USER", flightData.UID);
    setTimeout(() => {
      triggerSetter(!triggerState);
      handleClose();
    }, 1000);
  }

  UseOutsideClick(ref, () => {
    setIsMenuDropdownOpen(false);
  });

  return (
    <div style={{ width: "100%" }}>
      <div
        className="flights-card-container"
        key={flightData.UID}
        onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
      >
        <div className="card-date-menu-wrapper">
          <div className="card-date">
            <div className="date-image">
              <img src={CalendarSmallBlack} height="22" width="22" alt="" />
            </div>
            <div className="date-text">
              <p>{flightData.scheduleDate}</p>
            </div>
          </div>
          <div className="dropdown-wrapper-homepage">
            <div className="card-menu">
              <img
                src={MenuIcon}
                alt=""
                ref={ref}
                onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
              />
              {isMenuDropdownOpen ? (
                <div className="menu-dropdown-homepage">
                  <div className="menu-dropdown-tile-homepage">
                    <div className="tile-image">
                      <img src={Navigation} alt="" />
                    </div>
                    <div className="tile-text">Check-In</div>
                  </div>
                  <div className="menu-dropdown-tile-homepage">
                    <div className="tile-image">
                      <img src={Tasks} alt="" />
                    </div>
                    <div className="tile-text">Check List</div>
                  </div>
                  <div className="menu-dropdown-tile-homepage">
                    <div className="tile-image">
                      <img src={CheckIn} alt="" />
                    </div>
                    <div className="tile-text">My Itinerary</div>
                  </div>
                  <div
                    className="menu-dropdown-tile-homepage"
                    style={{ border: "none" }}
                    onClick={() => checkIfServiceMapped()}
                  >
                    <div className="tile-image">
                      <img src={Delete} alt="" />
                    </div>
                    <div className="tile-text">Remove</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="from-flight-to-wrapper">
          <div className="from-to-container">
            <span className="from-text">from</span>
            <span className="flight-code-text">{flightData.baseAirport}</span>
            <span
              className="time-text"
              style={
                flightData.baseAirport && flightData.baseAirport === "BLR"
                  ? { visibility: "visible" }
                  : { visibility: "hidden" }
              }
            >
              {flightData.scheduleTime.slice(0, 5)}
            </span>
          </div>
          <div className="flight-container">
            <div className="flight-image">
              <img
                src={config.url.serverURL + flightData.airlineImg}
                height="100%"
                alt=""
              />
            </div>
            <div className="flight-icon-number">
              <div className="flight-icon">
                <img src={DepartureSmall} height="22" width="22" alt="" />
              </div>
              <div className="flight-number">
                <p>{flightData.flightId}</p>
              </div>
            </div>
          </div>
          <div className="from-to-container">
            <span className="from-text">to</span>
            <span className="flight-code-text">
              {flightData.srcDestAirport}
            </span>
            <span
              className="time-text"
              style={
                flightData.srcDestAirport && flightData.srcDestAirport === "BLR"
                  ? { visibility: "visible" }
                  : { visibility: "hidden" }
              }
            >
              {flightData.scheduleTime.slice(0, 5)}
            </span>
          </div>
        </div>
        {/* <div className="boarding-gate-wrapper" style={{ display: "none" }}>
          <div className="boarding-gate-text">Bor 13:10</div>
          <div className="location-image">
            <img src={LocationSmall} height="22" width="22" alt="" />
          </div>
          <div className="boarding-gate-text">Gate 04B</div>
        </div> */}
      </div>
      {caller !== "Homepage" && showAdditionalDetails ? (
        <div className="flight-additional-details-container">
          <div className="checklist-container">
            <div className="checklist-header-container">
              <span className="checklist-title">Checklist</span>
              <span
                className="checklist-action"
                onClick={() => {
                  history.push({
                    pathname: `${url.replace("myFlights", "checklist")}`,
                  });
                }}
              >
                Details
              </span>
            </div>
            <div className="checklist-body-container">
              Go through the checklist to prepare yourself for an hassle free
              travel expirience
            </div>
          </div>
          <div className="itinerary-container">
            <div className="checklist-header-container">
              <span className="checklist-title">My Itinerary</span>
              <span
                className="checklist-action"
                onClick={() => {
                  history.push({
                    pathname: `${url.replace("myFlights", "myItinerary")}`,
                  });
                }}
              >
                Details
              </span>
            </div>
            <div className="checklist-body-container">
              To avoid any rush be at the airport at 11:30
            </div>
          </div>
        </div>
      ) : null}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        PaperProps={{
          style: {
            overflowY: "visible",
          },
        }}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Remove Flight
        </DialogTitle>
        <DialogContent style={{ overflowY: "visible" }}>
          <DialogContentText>
            You have some items in your cart that are mapped to this flight.
            Removing this flight will remove those items from your cart. Do you
            wish to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleRemoveFlight();
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              handleClose();
            }}
            color="primary"
            autoFocus
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlightCard;
