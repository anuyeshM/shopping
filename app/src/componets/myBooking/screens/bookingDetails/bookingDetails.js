import React, { useEffect, useContext, useState, Fragment } from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";
import AppContext from "../../../../commons/context";

import Loader from "../../../../components/loader/loader";
import config from "../../../../commons/config";
import callAPI from "../../../../commons/callAPI";
import FlightBand from "../../../../commons/components/molecules/flightBand/flightBand";

import iconFaq from "../../../../assets/images/myBookings/iconFaq.svg";
import iconsSupport from "../../../../assets/images/myBookings/iconSupport.svg";
import termsAndConditions from "../../../../assets/images/myBookings/termsAndConditions.svg";
import "./bookingDetails.css";
import BigIcon from "./components/bigIcon/bigIcon";
import Card from "../../subcomponent/card/card";

import Done from "../../../../assets/images/myBookings/done/done.png";
import arrow from "../../../../assets/images/myBookings/arrow.svg";
import calendar from "../../../../assets/images/myBookings/calendar.svg";
import chat from "../../../../assets/images/myBookings/chat.svg";
import star from "../../../../assets/images/myBookings/star.svg";
import starGreen from "../../../../assets/images/myBookings/starGreen.svg";
import SmallIcon from "./components/smallIcon/smallIcon";
import location from "../../../../assets/images/location.svg";

import SmartFeedback from "../../../smartFeedback/smartFeedback";
import { useParams } from "react-router";
import webTokenConfig from "../../../../commons/util/webTokenConfig";
import Util from "../../../../commons/util/util";
import api from "../../../../commons/api";
import PushAlert from "../../../../commons/notification";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useTheme, withStyles, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Select from "react-select";

const item = require("../../data/item.json");
const BookingDetails = (props) => {
  const { orderId } = useParams();
  const history = useHistory();
  const ClientCart = useContext(AppContext);
  const [isWebView] = useState(Util.isWebView());
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOpenForFeedback, setIsOpenForFeedback] = useState(false);
  const [details, setDetails] = useState(
    props.location.state ? props.location.state.details : item
  );
  const [qrCode] = useState(
    props.location.state ? props.location.state.orderQrCode : ""
  );
  const [cancellationReason, setCancellationReason] = useState(
    config.myBooking.cancellationReason
  );
  const [selectedCancellationReason, setSelectedCancellationReason] =
    useState();
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
    setSelectedCancellationReason();
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

  useEffect(() => {
    isWebView && sendDataToReactNative();
    setIsLoading(false);

    if (details.itemType === "product") {
      details.items.forEach((item) => {
        if (item.isOpenForFeedback) setIsOpenForFeedback(true);
      });
    } else {
      if (details.isOpenForFeedback) setIsOpenForFeedback(true);
    }
  }, []);

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        "Booking Details" + "-" + ClientCart.isEmpty()
      );
  }

  const handleFAQ = () => {};
  const handleSupport = () => {};
  const handleTC = () => {};

  const handleReviewIcon = () => {
    isOpenForFeedback && setIsFeedbackOpen(true);
  };

  const handleImageSubmission = (images) => {
    const formData = new FormData();
    images.forEach((item, index) => {
      console.log(URL.createObjectURL(item));
      formData.append(`File${index}`, item);
    });
    // Display the key/value pairs
    return formData;
  };

  const convertToFormData = (item) => {
    var formData = new FormData();
    console.log(item);
    Object.keys(item).forEach((key) => {
      if (key === "images") {
        item[key].forEach((imageItem) => {
          formData.append(`images`, imageItem, imageItem.name);
        });
      } else formData.append(key, item[key]);
    });

    return formData;
  };

  const handleFeedbackSubmit = () => {
    const apiURL = `${config.api.pastOrders}/${props.location.state.orderId}`;
    api
      .patch(apiURL, {
        pageNo: 0,
        limit: 1,
      })
      .then((data) => {
        if (data.status === 200) {
          let newIsOpenForFeedback = false;
          data.data[0].items.forEach((item) => {
            if (item.isOpenForFeedback) newIsOpenForFeedback = true;
          });
          console.log({ newIsOpenForFeedback });
          if (!newIsOpenForFeedback) setIsOpenForFeedback(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getCancelButtonStatus = () => {
    if (
      details.itemType === "variant" &&
      details.cancellationFlag &&
      (details.cancellationFlag === "Y" || details.cancellationFlag === "y")
    ) {
      if (details.statusDetails && details.statusDetails.jobStatus) {
        return (
          details.statusDetails.jobStatus !== "cancelled" &&
          details.statusDetails.jobStatus !== "Completed"
        );
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  const getCancellationPolicy = () => {
    let startTime = moment(new Date());
    let end = moment(details.serviceDateTime);
    var duration = moment.duration(end.diff(startTime));
    var minutes = Math.abs(Math.ceil(duration.asMinutes()));
    return (
      <ul>
        {details.cancellationPolicy.map((policyItem, index) => {
          if (policyItem.endValue === 9999) {
            if (minutes >= policyItem.startValue) {
              return (
                <li style={{ fontWeight: "bold" }} key={index}>
                  {policyItem.policyDesc}
                </li>
              );
            } else {
              return <li key={index}>{policyItem.policyDesc}</li>;
            }
          } else {
            if (
              minutes >= policyItem.startValue &&
              minutes < policyItem.endValue
            ) {
              return (
                <li style={{ fontWeight: "bold" }} key={index}>
                  {policyItem.policyDesc}
                </li>
              );
            } else {
              return <li key={index}>{policyItem.policyDesc}</li>;
            }
          }
        })}
      </ul>
    );
  };

  const cancelItem = async () => {
    try {
      const reason =
        selectedCancellationReason && selectedCancellationReason !== undefined
          ? selectedCancellationReason.label
          : "";
      let reqBody = [];
      reqBody.push({
        itemId: details.itemId,
        serviceDateTime: details.serviceDateTime ? details.serviceDateTime : "",
        reason: reason,
      });
      let apiURL = `${config.api.cancelService}/${orderId}`;
      let apiResponse = await api.post(apiURL, reqBody);
      let regResponse = apiResponse;
      if (regResponse.status === 201) {
        PushAlert.success(regResponse.data && regResponse.data.message);
        history.goBack();
      } else {
        PushAlert.warning(regResponse.message);
      }
    } catch (err) {
      PushAlert.error("Something went wrong! Please try again later");
      console.log(err);
    }
    handleClose();
  };

  return (
    <Fragment>
      {details && details.itemName && isOpenForFeedback && isFeedbackOpen ? (
        <SmartFeedback
          initialFeedback={"item"}
          overlay={false}
          orderId={
            (props.location.state && props.location.state.orderId) ||
            "615eb04d68b3fe52e1050acf"
          }
          handleSubmit={handleFeedbackSubmit}
          isFeedbackOpen={isFeedbackOpen}
          setIsFeedbackOpen={setIsFeedbackOpen}
        />
      ) : null}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="booking-details">
          {details && details.flight ? (
            <FlightBand
              id={details.flight.id}
              source={details.flight.source}
              destination={details.flight.destination}
              estimatedDeparture={details.flight.estimatedDeparture}
            />
          ) : null}
          <div className="scrollview">
            <div className="icons-wrapper">
              <BigIcon icon={iconFaq} label={"FAQs"} callback={handleFAQ} />
              <BigIcon
                icon={iconsSupport}
                label={"Support"}
                callback={handleSupport}
              />
              <BigIcon
                icon={termsAndConditions}
                label={"T&C"}
                callback={handleTC}
              />
            </div>
            <div className="content">
              {details && details.itemType === "product" ? (
                <Fragment>
                  <Card
                    item={details}
                    key={details.storeId}
                    status={details.status}
                    type={details.itemType}
                    noBackground={true}
                    cardClick={false}
                  />
                  <div className="card-decription"></div>
                  <div className="services">
                    <div className="services-header">
                      <h6 className="bold">Products</h6>
                    </div>
                    <div className="services-content">
                      {details.items.map((item, index) => (
                        <div key={index} className="done-wrapper">
                          <img src={Done} alt="notfound" />
                          <h6 className="done-text">{item.itemName}</h6>
                        </div>
                      ))}
                    </div>
                  </div>
                </Fragment>
              ) : (
                <Fragment>
                  <Card
                    item={details}
                    key={details.storeId}
                    status={details.status}
                    type={details.itemType}
                    noBackground={true}
                    cardClick={false}
                  />
                  <div className="card-decription">
                    {qrCode !== "" ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <img src={qrCode} />
                      </div>
                    ) : null}
                    {details.itemType === "variant" &&
                    props.location.state !== undefined &&
                    props.location.state.type === "active" ? (
                      details.cancellationFlag &&
                      (details.cancellationFlag === "Y" ||
                        details.cancellationFlag === "y") ? (
                        details.cancellationPolicy &&
                        details.cancellationPolicy.length > 0 ? (
                          <>
                            <div>Cancellation Policy</div>
                            {getCancellationPolicy()}
                          </>
                        ) : null
                      ) : (
                        <>
                          <div>Cancellation Policy</div>
                          <ul>
                            <li>
                              This service cannot be cancelled according to our
                              cancellation policy
                            </li>
                          </ul>
                        </>
                      )
                    ) : null}
                  </div>
                </Fragment>
              )}
              <div className="icons-wrapper">
                <SmallIcon image={location} />
                <SmallIcon image={chat} />
                <SmallIcon image={calendar} />
                <SmallIcon
                  image={isOpenForFeedback ? starGreen : star}
                  onClick={handleReviewIcon}
                />
              </div>
              <div className="content-footer">
                <div className="content-footer-button">
                  <h6 className="bold share-text">Share</h6>
                  <img
                    src={arrow}
                    alt="notfound"
                    height="16pt"
                    style={{ marginLeft: "7pt" }}
                  />
                </div>
                <div
                  className="content-footer-button"
                  style={
                    props.location.state !== undefined &&
                    props.location.state.type === "past"
                      ? {
                          visibility: "hidden",
                        }
                      : { visibility: "visible" }
                  }
                >
                  <h6
                    className={`bold ${
                      getCancelButtonStatus()
                        ? "cancel-text"
                        : "cancel-text-disabled"
                    }`}
                    onClick={() =>
                      getCancelButtonStatus() ? handleClickOpen() : null
                    }
                  >
                    Cancel
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
          Cancellation
        </DialogTitle>
        <DialogContent style={{ overflowY: "visible" }}>
          <DialogContentText>
            We're sorry that you are thinking about cancelling the service. Can
            you tell us why?
          </DialogContentText>
          <div className="modal-dropdown-container">
            <Select
              placeholder="Reason for cancellation"
              isSearchable={false}
              value={selectedCancellationReason}
              onChange={(e) => setSelectedCancellationReason(e)}
              options={cancellationReason}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              cancelItem();
            }}
            color="primary"
            autoFocus
          >
            Cancel Service
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default BookingDetails;
