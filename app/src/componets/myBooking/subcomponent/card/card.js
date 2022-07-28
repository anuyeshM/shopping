import React from "react";
import { useHistory } from "react-router-dom";
import config from "../../../../commons/config";
import "./card.css";
const Card = (props) => {
  const history = useHistory();
  const handleCardClick = () => {
    if (!props.cardClick) {
      history.push({
        pathname: `/myBookings/${props.orderId}`,
        state: {
          orderId: props.orderId,
          type: props.type,
          details: props.item,
          orderQrCode: props.orderQrCode,
        },
      });
    }
  };

  const getApplicableFor = () => {
    if (props.item.uom && props.item.uom.length > 0) {
      let found = props.item.uom.find(
        (ele) => ele.primaryFlag === "Y" || ele.primaryFlag === "y"
      );
      if (found) {
        return found.type;
      } else {
        return "Qty";
      }
    } else {
      return "Qty";
    }
  };

  const getPpgContactDetails = (contact, type) => {
    let primaryContact = contact.find(
      (ele) => ele.primaryContactFlag === "Y" || ele.primaryContactFlag === "y"
    );
    if (primaryContact) {
      if (type === "phNo") return primaryContact.contactNo;
      else if (type === "email") return primaryContact.email;
      else return "";
    } else {
      return "";
    }
  };

  return (
    <div
      className={`booking-card-container ${
        props.noBackground ? "card-noBackground" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="booking-card-content">
        <div className="image-wrapper">
          <img
            src={
              props.item.itemType === "variant"
                ? `${props.item.productImageUrl[0]}`
                : config.url.serverURL + `${props.item.productImageUrl[0]}`
            }
            style={{ borderRadius: "16pt", width: "80pt" }}
          />
        </div>

        {props.item.itemType === "product" ? (
          <div className="card-info-wrapper">
            <div className="card-title-text">{props.item.itemName}</div>
            {/* <div className='card-text card-subHeader-text'>
              Code:{' '}
              <span className='card-subHeader-text'>
                {props.item.itemId.slice(-5)}
              </span>
            </div> */}
            {props.item.delivery.itemDeliveryOption && (
              <div className="card-text">
                Delivery Option:{" "}
                <span className="card-text-value">
                  {props.item.delivery.itemDeliveryOption}
                </span>
              </div>
            )}
            <div className="card-text">
              Quantity:{" "}
              <span className="card-text-value">{props.item.itemQuantity}</span>
            </div>
            {props.status && (
              <div className="card-text">
                {`Status: `}
                <span className="card-text-value">{props.status}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="card-info-wrapper">
            {props.item.storeName ? (
              <div className="card-title-text">{`${props.item.itemName} - ${
                props.item.storeName ? props.item.storeName : ""
              }`}</div>
            ) : (
              <div className="card-title-text">{`${props.item.itemName}`}</div>
            )}
            {props.item.variant && (
              <div className="card-text">
                Variant:{" "}
                <span className="card-text-value">{props.item.variant}</span>
              </div>
            )}
            {props.item.rating && (
              <div className="card-text">
                Rating:{" "}
                <span className="card-text-value">{props.item.rating}</span>
              </div>
            )}
            <div className="card-text">
              {getApplicableFor()}:{" "}
              <span className="card-text-value">{props.item.itemQuantity}</span>
            </div>
            {props.item.serviceProviderInfo &&
            Object.keys(props.item.serviceProviderInfo).length > 0 &&
            props.item.serviceProviderInfo.providerName ? (
              <div className="card-text">
                Service Provider:{" "}
                <span className="card-text-value">
                  {props.item.serviceProviderInfo.providerName}
                </span>
              </div>
            ) : (
              <div className="card-text">
                Service Provider:{" "}
                <span className="card-text-value">Not Allocated</span>
              </div>
            )}
            {props.item.statusDetails &&
            Object.keys(props.item.statusDetails).length > 0 &&
            props.item.statusDetails.jobStatus ? (
              <div className="card-text">
                Status:{" "}
                <span className="card-text-value">
                  {props.item.statusDetails.jobStatus}
                </span>
              </div>
            ) : (
              <div className="card-text">
                Status: <span className="card-text-value">Not Started</span>
              </div>
            )}
            {props.item.serviceFeedback &&
            Object.keys(props.item.serviceFeedback).length > 0 &&
            props.item.serviceFeedback.feedbackRating &&
            props.item.serviceFeedback.feedbackMaxRating ? (
              <div className="card-text">
                Rating:{" "}
                <span className="card-text-value">
                  {`${props.item.serviceFeedback.feedbackRating}/${props.item.serviceFeedback.feedbackMaxRating}`}
                </span>
              </div>
            ) : null}
            {props.item.contact && props.item.contact.length > 0 ? (
              <div className="card-text">
                Contact No:{" "}
                <a
                  href={`tel:${getPpgContactDetails(
                    props.item.contact,
                    "phNo"
                  )}`}
                  className="card-text-value"
                  onClick={(e) => e.stopPropagation()}
                  style={{ textDecoration: "none" }}
                >
                  {getPpgContactDetails(props.item.contact, "phNo")}
                </a>
              </div>
            ) : null}
            {props.item.contact && props.item.contact.length > 0 ? (
              <div className="card-text">
                Email:{" "}
                <a
                  className="card-text-value"
                  href={`mailto:${getPpgContactDetails(
                    props.item.contact,
                    "email"
                  )}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ lineBreak: "anywhere", textDecoration: "none" }}
                >
                  {getPpgContactDetails(props.item.contact, "email")}
                </a>
              </div>
            ) : null}
            {props.item.serviceDateTime && props.item.serviceDateTime !== "" ? (
              <div className="card-text">
                Service Datetime:{" "}
                <span className="card-text-value">
                  {`${props.item.serviceDateTime}`}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
