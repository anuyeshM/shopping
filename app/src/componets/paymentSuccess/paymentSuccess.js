// dependencies
import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import validator from "validator";

import UseOutsideClick from "../../commons/useOutsideClick";
import Modal from "react-bootstrap/Modal";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// misc
import flightImage from "../../assets/images/payment-success.svg";
import mail from "../../assets/images/mail.png";
import download from "../../assets/images/download.png";
import IconDown from "../../assets/images/iconDown.png";

import "./successStyle.css";
import config from "../../commons/config";
import PushAlert from "../../commons/notification";
import Loader from "../loader/loader";
import api from "../../commons/api";
import Util from "../../commons/util/util";

const PaymentSuccess = (props) => {
  const params = useParams();
  const refLanguage = useRef();
  const [orderid] = useState(params.orderid);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [accountId, setAccountId] = useState("");
  const [transData, setTransactionData] = useState({});
  const [addOnesSelected, setAddOnesSelected] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [validEmail, setValidEmail] = useState(true);
  const [languageData, setLanguageData] = useState([
    {
      id: 1,
      value: "English",
    },
    {
      id: 2,
      value: "Hindi",
    },
    {
      id: 3,
      value: "Kannada",
    },
    {
      id: 4,
      value: "Tamil",
    },
    {
      id: 5,
      value: "Telugu",
    },
    {
      id: 6,
      value: "Malayalam",
    },
  ]);
  const defaultSelectedLanguage = languageData[0] ? languageData[0].value : "";
  const [selectedLanguage, setSelectedLanguage] = useState(
    defaultSelectedLanguage
  );
  const [addOnesData, setAddOnesData] = useState([
    {
      label: "WheelChair",
      value: "WheelChair",
      selectedFlag: false,
    },
    {
      label: "Baby Stroller",
      value: "Baby Stroller",
      selectedFlag: false,
    },
  ]);
  const [isWebView] = useState(Util.isWebView());

  useEffect(() => {
    // call api to get transaction details
    // bind state variables to api response
    // let component render with dynamic values

    function pullOrderDetails() {
      api
        .post(config.api.orderSummary, {
          id: orderid,
        })
        .then((orderRes) => {
          if (
            orderRes &&
            orderRes.data &&
            orderRes.data.payments &&
            orderRes.data.shipping
          ) {
            const transactionId = orderRes.data.payments.transactionId;
            const purchaseDate = new Date(
              orderRes.data.createdAt.substring(0, 10)
            ).toLocaleDateString();
            const paymentType = orderRes.data.payments.mode;

            let merchantSet = new Set();
            // orderRes.data.shipping[0].items.forEach(x => merchantSet.add(x.shopName));
            orderRes.data.shipping.forEach((x) =>
              merchantSet.add(x.items[0].shopName)
            );

            const merchant = Array.from(merchantSet).join(", ");

            setTransactionData({
              transactionId,
              purchaseDate,
              paymentType,
              merchant,
            });

            // console.log("TransData", transData);

            window.sessionStorage.setItem("payRedir", "");
            window.sessionStorage.setItem("delRedir", "");
            window.sessionStorage.setItem("selDelRedir", "");
            window.sessionStorage.setItem("accountIDRedir", "");
            window.sessionStorage.setItem("couponAmountRedir", "");
            window.sessionStorage.setItem("couponsListRedir", "");

            setPhoneNumber(orderRes.data.mobile);
            setAccountId(orderRes.data.accountId);
            setName(orderRes.data.name);
            setEmail(orderRes.data.email);
            setIsLoading(false);
            handleUpdateCoupon(orderRes.data.payments.param1);
            handleGenerateCoupon(
              orderRes.data.email,
              orderRes.data.name,
              orderRes.data.mobile,
              transactionId
            );
          } else {
            PushAlert.error("Invalid Order Id Received...");
            setTimeout(() => {
              PushAlert.info("You may close this tab");
            }, 2000);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    isLoading && pullOrderDetails();
  }, []);

  UseOutsideClick(refLanguage, () => {
    setShowLanguageDropdown(false);
  });

  function handleLanguageTileClick(value) {
    setSelectedLanguage(value);
  }

  function handleCheckbox(selValue) {
    var arr = new Array();
    let subData = addOnesData;
    for (let data of subData) {
      if (data.value == selValue) {
        data.selectedFlag =
          data.selectedFlag == null ? true : !data.selectedFlag;
        break;
      }
    }
    for (let fdata of subData) {
      if (fdata.selectedFlag) {
        arr.push(fdata.value);
      }
    }
    setAddOnesSelected(arr);
    setAddOnesData([...subData]);
  }

  function handleOrderConfirmation() {
    setIsSaving(true);
    let apiURL = "";
    if (isWebView) apiURL = config.api.orderConfirmation + "/pax";
    else apiURL = config.api.orderConfirmation + "/contactless";

    api
      .post(apiURL, {
        orderid,
        transno: transData.transactionId,
        name: name,
        phone: phoneNumber,
        email: email,
      })
      .then((statusMessage) => {
        PushAlert.success(statusMessage.message);

        // setTimeout(() => {
        //   PushAlert.info(`An email has been sent with attached e-receipt`);
        // }, 2500);

        setIsSaving(false);
        setModalIsVisible(false);
      })
      .catch((err) => {
        PushAlert.error("Something went wrong whilst saving your details...");
        console.log(err);
      });
  }

  function handleUpdateCoupon(coupon) {
    let apiURL = "";
    if (isWebView) apiURL = config.api.updateCoupon + "/pax";
    else apiURL = config.api.updateCoupon + "/contactless";
    api
      .post(apiURL, {
        coupon,
        orderid,
      })
      .then((statusMessage) => {})
      .catch((err) => {
        PushAlert.error(
          "Something went wrong whilst updating your coupon, contact Support for more information."
        );
        console.log(err);
      });
  }

  function handleGenerateCoupon(email, name, phone, transno) {
    setIsSaving(true);
    let apiURL = "";
    if (isWebView) apiURL = config.api.generateCoupon + "/pax";
    else apiURL = config.api.generateCoupon + "/contactless";

    api
      .post(apiURL, { orderid, transno, name, phone, email })
      .then((statusMessage) => {
        // PushAlert.success(statusMessage.message);
        // setTimeout(() => {
        //   PushAlert.info(`An email has been sent with generated coupon`);
        // }, 2500);

        setIsSaving(false);
        setModalIsVisible(false);
      })
      .catch((err) => {
        PushAlert.error(
          "Something went wrong whilst generating your coupon..."
        );
        console.log(err);
      });
  }

  function handleSubmit() {
    if (orderid && name && phoneNumber && email) {
      if (validateEmail(email) && validator.isEmail(email)) {
        handleOrderConfirmation();
        setValidEmail(true);
      } else {
        setValidEmail(false);
      }
    } else PushAlert.error("One or more input fields are empty...");
  }

  const goHome = () => {
    // props.history.push(`/`);
    props.history.push(`/homepage`);
  };

  const goHomeWebview = () => {
    props.history.push(
      `/homepage?accountId=${accountId}&name=${name}&mobile=${phoneNumber}`
    );
  };

  const validateEmail = (email) => {
    const expression =
      /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;

    console.log("valid:", expression.test(String(email).toLowerCase()));
    return expression.test(String(email).toLowerCase());
    // console.log({ email });

    // return false;
  };

  return (
    <div>
      {isLoading || isSaving ? (
        <div style={{ textAlign: "center", marginTop: "15rem" }}>
          <Loader />
        </div>
      ) : (
        <div className="payment-container">
          <div className="flight-container">
            <img src={flightImage} alt={"flight"} className="flight" />
          </div>
          <div className="text-container">
            <span className="text">Payment successful!</span>
          </div>
          <div className="desc-text-container">
            <div className="description">Thanks for shopping!</div>
            <div className="description">
              You may keep this screen as reference or use SMS to collect your
              order at the counters.
            </div>
          </div>
          <div className="transaction-container">
            <div className="transactionNoContainer">
              <span className="transaction-details-label-head">
                Transaction Details:
              </span>
              <span>
                <img src={mail} alt={"mail"} className="hidden mail" />
              </span>
              <span>
                <img
                  src={download}
                  alt={"download"}
                  className="hidden download"
                />
              </span>
            </div>

            <div className="transactionNoContainer">
              <span className="transaction-details-label">Transaction No:</span>
              <span className="transaction-details-value">
                {transData.transactionId}
              </span>
            </div>

            <div className="transactionNoContainer">
              <span className="transaction-details-label">Date:</span>
              <span className="transaction-details-value">
                {transData.purchaseDate}
              </span>
            </div>

            <div className="transactionNoContainer">
              <span className="transaction-details-label">Type:</span>
              <span className="transaction-details-value">
                {transData.paymentType}
              </span>
            </div>

            <div className="transactionNoContainer">
              <span className="transaction-details-label">Merchant:</span>
              <span className="transaction-details-value">
                {transData.merchant}
              </span>
            </div>
          </div>
          {isWebView ? (
            <div className="success-button-container-webview">
              <button
                className="go-home-webview"
                onClick={() => setModalIsVisible(true)}
              >
                Continue
              </button>
              <button
                className="go-home-webview"
                // className={
                //   orderid &&
                //   transData.transactionId &&
                //   name &&
                //   phoneNumber &&
                //   email
                //     ? 'go-home-webview'
                //     : 'go-home-webview-disabled'
                // }
                // disabled={
                //   orderid &&
                //   transData.transactionId &&
                //   name &&
                //   phoneNumber &&
                //   email
                //     ? false
                //     : true
                // }
                onClick={() => goHomeWebview()}
              >
                Go Home
              </button>
            </div>
          ) : (
            <div className="success-button-container">
              <div
                className="success-button receipt"
                onClick={() => setModalIsVisible(true)}
              >
                E-Receipt
              </div>
              <div className="success-button gohome" onClick={goHome}>
                Shop More
              </div>
            </div>
          )}
          <Modal
            show={modalIsVisible}
            onHide={() => setModalIsVisible(false)}
            className="order-confirmation"
            dialogClassName="payment-modal-content"
            contentClassName="payment-modal-content"
          >
            <div className="payment-modal-content" id="content">
              <div className="payment-content-container">
                <button
                  className="modal-close-line-container"
                  draggable={true}
                  onClick={() => setModalIsVisible(false)}
                  onTouchEnd={() => setModalIsVisible(false)}
                >
                  <span className="modal-close-line"></span>
                </button>
                <div className="modalHeadingContainer">
                  <img
                    src={require("../../assets/images/arrowLeft.svg")}
                    alt="la"
                    width="20"
                    height="20"
                    onClick={() => setModalIsVisible(false)}
                  />
                  <div className="modalHeading">Passenger Details</div>
                </div>
                <div className="modalDescriptionContainer">
                  <div className="modalDescription">
                    Please provide your contact details to get e-receipt.
                  </div>
                </div>
                <div className="name-input-container">
                  <div className="textInputHeading">Full Name</div>
                  <input
                    type="text"
                    className="textInput"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="name-input-container">
                  <div className="textInputHeading">Phone Number</div>
                  <div className="phone-input">
                    <PhoneInput
                      class="inputClass"
                      country={"in"}
                      value={phoneNumber}
                      onChange={(phNo) => setPhoneNumber(phNo)}
                      autoFocus={true}
                    />
                  </div>
                </div>
                <div
                  className="name-input-container"
                  style={{ height: !validEmail ? "80pt" : null }}
                >
                  <div className="textInputHeading">Email</div>
                  <input
                    type="email"
                    className="textInput"
                    style={{ border: !validEmail ? "1px solid #B00020" : null }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {!validEmail ? (
                    <div className="email-error-message">Invalid Email!</div>
                  ) : null}
                </div>
                {isWebView ? (
                  <div className="name-input-container">
                    <div className="textInputHeading">Language Preference</div>
                    <div
                      className="language-picker-wrapper"
                      onClick={() =>
                        setShowLanguageDropdown(!showLanguageDropdown)
                      }
                      ref={refLanguage}
                    >
                      <div className="react-language">{selectedLanguage}</div>
                      <img src={IconDown} style={{ marginRight: 10 }} />
                      {showLanguageDropdown ? (
                        <div className="language-dropdown">
                          {languageData.map((item, index) => (
                            <div
                              className="language-tile"
                              key={index}
                              onClick={() =>
                                handleLanguageTileClick(item.value)
                              }
                            >
                              {item.value}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {/* {isWebView ? 
                    <div className='add-ones-container'>
                    <div className="textInputHeading">Add Ones</div>
                      <div className='add-ones-checkbox-container'>
                        {addOnesData.map((item, index) => (
                          <label style={{ width: "50%", float: "left" }} key={index}>
                            <Checkbox
                              checked={item.selectedFlag}
                              onChange={() => handleCheckbox(item.value)}
                            />
                            <span style={{ marginLeft: '10px', fontSize: '12pt' }}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                  </div>
                  : 
                    null} */}
                <div className="modal-submit-button-container">
                  <button
                    className="modal-submit-button"
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    Submit
                  </button>
                </div>
                {/* <button
                    className="order-confirmation-continue-button"
                    onClick={() => {handleOrderConfirmation()}}
                  >
                    Submit
                  </button> */}
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};
export default PaymentSuccess;
