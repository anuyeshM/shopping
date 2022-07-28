// dependencies
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../../commons/config";
import PushAlert from "../../commons/notification";
import Loader from "../loader/loader";
import api from "../../commons/api";

import "./failStyle.css";
import Util from "../../commons/util/util";

export default function PaymentFail(props) {
  const params = useParams();
  const [isWebView] = useState(Util.isWebView());
  const [orderid] = useState(params.orderid);
  const [isLoading, setIsLoaded] = useState(true);
  const [shopId, setShopId] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    function pullOrderDetails() {
      api
        .post(config.api.orderSummary, {
          id: orderid,
        })
        .then((orderRes) => {
          if (orderRes && orderRes.data) {
            setPhoneNumber(orderRes.data.mobile);
            setAccountId(orderRes.data.accountId);
            setName(orderRes.data.name);
            let cartObj = {};
            orderRes.data.shipping.forEach((y) => {
              y.items.forEach((x) => {
                void 0 === cartObj[x.shopId] &&
                  (cartObj[x.shopId] = { storeId: x.shopId, items: [] });

                cartObj[x.shopId].items.push({
                  itemId: x.productId,
                  itemLabel: x.title,
                  itemPrice: x.price.amount,
                  itemQuantity: x.quantity,
                  itemType: x.itemType,
                  maxQuantity: 5,
                  addOn: x.addOns ? x.addOns : [],
                  flightId: y.flight && y.flight.id ? y.id : "",
                  flightUid: y.flight && y.flight.uid ? y.uid : "",
                });
              });
            });

            window.sessionStorage.setItem("payRedir", JSON.stringify(cartObj));
            (void 0 === shopId || "" === shopId) &&
              PushAlert.error("Please try payment again...");
            setShopId(orderRes.data.shopId);
          } else {
            PushAlert.error("Invalid Order Id Received...");
            setTimeout(() => {
              PushAlert.info("You may close this tab");
            }, 2000);
          }
          setIsLoaded(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    isLoading && pullOrderDetails();
  }, []);

  const gotoHelpPage = () => {
    window.location.href = "https://graymatter.co.in";
  };

  const gotoCart = () => {
    if (isWebView)
      // props.history.push(`/homepage?accountId=${accountId}&name=${name}&mobile=${phoneNumber}`);
      props.history.push(`/cart`);
    else props.history.push(`/cart`);
  };

  return (
    <div>
      {isLoading ? (
        <div style={{ textAlign: "center", marginTop: "15rem" }}>
          <Loader />
        </div>
      ) : (
        <div className="payment-fail">
          <div className="payment-fail-info">
            <div className="payment-fail-icon"></div>
            <div className="payment-fail-title">Oh no, Payment failed!</div>
            <div className="payment-fail-description">
              {void 0 === shopId || "" === shopId
                ? `It seems there was an issue with order-id. Unfortunately you'll have to start over again...`
                : `Don't worry, you can try again ...`}
            </div>
            <div className="payment-fail-description">
              If amount was deducted from your account, it will be credited back
              in 3-5 business days.
            </div>
            {void 0 === shopId || "" === shopId ? (
              ""
            ) : (
              <div className="payment-redirect" onClick={gotoCart}>
                Goto Cart
              </div>
            )}
          </div>
          <div className="hidden help">
            <div className="help-text">Need more help ?</div>
            <div className="help-link" onClick={gotoHelpPage}>
              Read here
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
