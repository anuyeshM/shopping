// dependencies
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import OtpInput from "react-otp-input";
import "react-phone-input-2/lib/style.css";
import config from "../../commons/config";
import PushAlert from "../../commons/notification";
import "./verificationStyle.css";
import AppContext from "../../commons/context";
import { Context as DeliveryContext } from "../../context/DeliveryOptionsContext";
import { Context as AuthContext } from "../../context/AuthContext";
import { CouponContext } from "../../context/CouponProvider";
import api from "../../commons/api";
import Util from "../../commons/util/util";
import Loader from "../loader/loader";

export default function MobileVerification(props) {
  const ClientCart = useContext(AppContext);
  const couponContext = useContext(CouponContext);
  const { state: deliveryState } = useContext(DeliveryContext);
  const { state: authState } = useContext(AuthContext);
  const history = useHistory();
  const [stageId, setStageId] = useState(0);
  const [mobileNo, setMobileNo] = useState("");
  const [otp, setOTP] = useState("");
  const [isWebView] = useState(Util.isWebView());
  const [isLoading, setIsLoading] = useState(isWebView ? true : false);
  const [pseudoUserId, setPseudoUserId] = useState();
  const [paymentGatetWay, setPaymentGatetWay] = useState("");

  useEffect(() => {
    paymentGetwayConfiguration();
  }, []);

  const sendOTP = () => {
    setPseudoUserId("");
    api
      .post(config.api.genOtp_v2, {
        contact: mobileNo,
      })
      .then((regResponse) => {
        if ("success" === regResponse.type && 200 === regResponse.status) {
          PushAlert.success(regResponse.message);
          if (regResponse.data) setPseudoUserId(regResponse.data);
          setStageId(1);
        } else {
          PushAlert.error(regResponse.message);
          setStageId(0);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const cancelOTP = (event) => {
    props.onChange(false);
    setStageId(0);
    setPseudoUserId("");
  };

  const resendOTP = () => {
    setPseudoUserId("");
    api
      .post(config.api.genOtp_v2, {
        contact: mobileNo,
      })
      .then((regResponse) => {
        if ("success" === regResponse.type && 200 === regResponse.status) {
          setOTP("");
          if (regResponse.data) setPseudoUserId(regResponse.data);
          PushAlert.success(regResponse.message);
        } else {
          PushAlert.error(regResponse.message);
        }
      })
      .catch((err) => console.log(err));
  };
  const formattedDueDate = () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    return dd + "/" + mm + "/" + yyyy;
  };
  const paymentGetwayConfiguration = async () => {
    const apiURL = config.api.gatewayConfiguration;
    api
      .get(apiURL)
      .then((response) => {
        if (response.data) {
          setPaymentGatetWay(response.data);
          if (isWebView) createOrderWebview(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const createOrder = (accountId, accessToken) => {
    setIsLoading(true);
    let cartObject = ClientCart.getCart();
    Object.entries(cartObject).forEach((item) => {
      let localObj = item[1];
      let deliveryObject = {};
      let newLocalObj = Object.assign({}, localObj, {
        deliveryOptions: deliveryObject,
      });
      cartObject[item[1].storeId] = newLocalObj;
    });

    Object.values(cartObject).forEach((x) => {
      x.items.forEach((citem) => {
        if (citem.mandatoryFieldsFilled) delete citem.mandatoryFieldsFilled;
      });
    });

    let reqBody = {
      items: Object.values(cartObject),
      promo: props.promoCode ? props.promoCode : "",
      paymentGateWayService:
        paymentGatetWay && paymentGatetWay === "phicom" ? "phicom" : null,
      dueDate: formattedDueDate(),
      mobileNo:
        config.phiCom.defaultPhNo !== "" ? config.phiCom.defaultPhNo : mobileNo,
      emailID: config.phiCom.defaultEmailId,
      desc: "Test order",
      paymentIntegratorURL: config.paymentGateWayServiceURL,
    };
    api
      .post(config.api.checkout, reqBody, { Authorization: accessToken })
      .then((regResponse) => {
        if ("success" === regResponse.type && 201 === regResponse.status) {
          let tempCart = cartObject;
          Object.values(tempCart).forEach((x) => {
            x.items.forEach((citem) => {
              if (citem.itemType === "service")
                citem["mandatoryFieldsFilled"] = true;
            });
          });
          window.sessionStorage.setItem(
            "payRedir",
            JSON.stringify(ClientCart.getCart())
          );
          window.sessionStorage.setItem(
            "delRedir",
            JSON.stringify(deliveryState.deliveryData)
          );
          window.sessionStorage.setItem(
            "selDelRedir",
            JSON.stringify(deliveryState.selectedDeliveryData)
          );
          window.sessionStorage.setItem(
            "accountIdRedir",
            JSON.stringify(accountId)
          );
          window.sessionStorage.setItem(
            "couponAmountRedir",
            JSON.stringify(couponContext.couponAmount)
          );
          window.sessionStorage.setItem(
            "couponsListRedir",
            JSON.stringify(couponContext.couponsList)
          );
          if (paymentGatetWay !== "phicom") {
            history.push({
              pathname: `/shoppingDetails`,
              state: {
                data: {
                  orderId: regResponse.data.orderId,
                  accountId: regResponse.data.accountId,
                  totalAmount: regResponse.data.totalAmount,
                },
              },
            });
          } else {
            if (
              regResponse.data.redirectUrl &&
              regResponse.data.redirectUrl !== ""
            ) {
              window.location = regResponse.data.redirectUrl;
            } else return false;
          }
        } else {
          PushAlert.error("Order Creation Failed");
          PushAlert.info(regResponse.message);
          setIsLoading(false);
          cancelOTP();
        }
      })
      .catch((err) => {
        PushAlert.error("Error in creating order");
        console.log(err);
      });
  };

  const createOrderWebview = (paymentGatewayStr) => {
    const accountId = authState.accountID;
    const contactNo = authState.contact;
    let cartObject = ClientCart.getCart();
    Object.entries(cartObject).forEach((item) => {
      let isProduct = false;
      deliveryState.selectedDeliveryData.forEach((deliveryItem) => {
        if (item[0] === deliveryItem.storeId) {
          let localObj = item[1];
          let deliveryObject = {
            flightUID: deliveryItem.flightUID,
            flightId: deliveryItem.flightId,
            deliveryTime: deliveryItem.deliveryTime,
            deliveryOption: deliveryItem.deliveryOption,
            deliveryAddress: deliveryItem.deliveryAddress,
            deliveryPincode: deliveryItem.deliveryPincode,
          };
          let newLocalObj = Object.assign({}, localObj, {
            deliveryOptions: deliveryObject,
          });
          cartObject[item[1].storeId] = newLocalObj;
          isProduct = true;
        }
      });
      if (!isProduct) {
        let localObj = item[1];
        let deliveryObject = {};
        let newLocalObj = Object.assign({}, localObj, {
          deliveryOptions: deliveryObject,
        });
        cartObject[item[1].storeId] = newLocalObj;
      }
    });

    Object.values(cartObject).forEach((x) => {
      x.items.forEach((citem) => {
        delete citem.deliveryOptions;
        delete citem.ruleId;
        if (citem.mandatoryFieldsFilled) delete citem.mandatoryFieldsFilled;
      });
    });

    let reqBody = {
      items: Object.values(cartObject),
      promo: props.promoCode ? props.promoCode.toUpperCase() : "",
      paymentGateWayService:
        paymentGatewayStr && paymentGatewayStr === "phicom" ? "phicom" : null,
      dueDate: formattedDueDate(),
      mobileNo:
        config.phiCom.defaultPhNo !== "" ? config.phiCom.defaultPhNo : mobileNo,
      emailID: config.phiCom.defaultEmailId,
      desc: "Test order",
      paymentIntegratorURL: config.paymentGateWayServiceURL,
    };

    api
      .post(config.api.checkout, reqBody)
      .then((regResponse) => {
        if ("success" === regResponse.type && 201 === regResponse.status) {
          PushAlert.success(regResponse.message);
          let tempCart = cartObject;
          Object.values(tempCart).forEach((x) => {
            x.items.forEach((citem) => {
              if (citem.itemType === "service")
                citem["mandatoryFieldsFilled"] = true;
            });
          });
          window.sessionStorage.setItem(
            "payRedir",
            JSON.stringify(ClientCart.getCart())
          );
          window.sessionStorage.setItem(
            "delRedir",
            JSON.stringify(deliveryState.deliveryData)
          );
          window.sessionStorage.setItem(
            "selDelRedir",
            JSON.stringify(deliveryState.selectedDeliveryData)
          );
          window.sessionStorage.setItem(
            "accountIdRedir",
            JSON.stringify(accountId)
          );
          window.sessionStorage.setItem(
            "couponAmountRedir",
            JSON.stringify(couponContext.couponAmount)
          );
          window.sessionStorage.setItem(
            "couponsListRedir",
            JSON.stringify(couponContext.couponsList)
          );
          if (paymentGatewayStr !== "phicom") {
            history.push({
              pathname: `/shoppingDetails`,
              state: {
                data: {
                  orderId: regResponse.data.orderId,
                  accountId: regResponse.data.accountId,
                  totalAmount: regResponse.data.totalAmount,
                },
              },
            });
          } else {
            if (
              regResponse.data.redirectUrl &&
              regResponse.data.redirectUrl !== ""
            ) {
              window.location = regResponse.data.redirectUrl;
            } else return false;
          }
        } else {
          PushAlert.error("Order Creation Failed");
          PushAlert.error(regResponse.message);
          setIsLoading(false);
          cancelOTP();
        }
      })
      .catch((err) => {
        PushAlert.error("Error in creating order");
        console.log(err);
      });
  };

  const verifyOTP = () => {
    const apiUrl = pseudoUserId
      ? config.api.validateToReg_v2
      : config.api.validateOtp_v2;
    const body = pseudoUserId
      ? {
          pseudoUserId,
          otp: otp,
        }
      : {
          contact: mobileNo,
          otp: otp,
        };

    api
      .post(apiUrl, body)
      .then((regResponse) => {
        if (200 === regResponse.status && "success" === regResponse.type) {
          PushAlert.success(
            regResponse.message ? regResponse.message : "OTP Verified"
          );

          createOrder(regResponse.data.userId, regResponse.data.accessToken);
        } else {
          PushAlert.error(
            regResponse.message
              ? regResponse.message
              : "OTP Verification Failed"
          );
        }
      })
      .catch((err) => console.log(err));
  };

  let s1ViewClass = 0 === stageId ? "" : "hidden";
  let s2ViewClass = 0 === stageId ? "hidden" : "";

  return (
    <Fragment>
      {!isWebView ? (
        <div data-id="mv" className="mv">
          <div className="disabled mv-disabled"></div>
          <div
            data-id="mvcStage1"
            className={`${s1ViewClass} mvs1 mv-container`}
          >
            <div className="info">
              <div className="info-title">Confirm Phone Number</div>
              <div className="info-desc">
                Transaction details will be sent to this number.
              </div>
              <div className="info-desc">
                You will receive an OTP on your number.
              </div>
            </div>
            <div className="user-input">
              <div className="user-guide-text">Phone Number</div>
              <PhoneInput
                country={"in"}
                value={mobileNo}
                onChange={(phNum) => setMobileNo(phNum)}
                autoFocus={true}
                placeholder="Enter Mobile Number"
                onKeyDown={(e) => "Enter" === e.key && sendOTP()}
              />
            </div>
            <div className="action">
              <div
                data-id="cancelValidation"
                className="action-button cancel-validation"
                onClick={cancelOTP}
              >
                Cancel
              </div>
              <div
                data-id="sendOTP"
                className={
                  mobileNo.length >= 12
                    ? "action-button send-otp"
                    : "action-button send-otp-disabled"
                }
                onClick={mobileNo.length >= 12 ? sendOTP : null}
              >
                Send OTP
              </div>
            </div>
          </div>
          <div
            data-id="mvcStage2"
            className={`${s2ViewClass} mvs2 mv-container`}
          >
            <div className="info">
              <div className="info-title">Confirm OTP</div>
              <div data-id="infoStage2" className="info-desc">
                Please enter the code sent to your mobile:
              </div>
            </div>
            <div className="user-input">
              <div data-id="otpContainer" className="input-item otp-container">
                <OtpInput
                  value={otp}
                  onChange={(otp) => setOTP(otp)}
                  numInputs={4}
                  separator={""}
                />
              </div>
              <div className="resend-container">
                <div className="resend-static">Didn't receive the code ?</div>
                <div
                  data-id="resend"
                  className="resend-action"
                  onClick={resendOTP}
                >
                  Resend
                </div>
              </div>
            </div>
            <div className="action">
              <div
                data-id="cancelValidation"
                className="action-button cancel-validation"
                onClick={cancelOTP}
              >
                Cancel
              </div>
              <div
                data-id="verifyOTP"
                className="action-button send-otp"
                onClick={verifyOTP}
              >
                Verify OTP
              </div>
            </div>
          </div>
          <div className="phantom-white-space"></div>
        </div>
      ) : null}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100vw",
            backgroundColor: "#f7f7f7",
            zIndex: 999,
            position: "absolute",
            top: "0px",
          }}
        >
          <Loader />
        </div>
      ) : null}
    </Fragment>
  );
}
