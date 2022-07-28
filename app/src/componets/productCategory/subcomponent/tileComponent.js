import React from "react";
import config from "../../../commons/config";

/**
 * TEMPORARY TILE COMPONENT FOR LOCAL TEST
 * -- need to consume elastic implemented tile component from product listing
 * @param {} props
 */

const ProductTile = (props) => {
  return (
    <div className="product-card">
      <div
        data-id={props._id}
        data-price={props.price}
        data-name={props.productName}
        className="no-select add-product add-product-img"
      ></div>
      <div className="product-image-wrapper">
        <img
          src={
            props.productImageUrl instanceof Array
              ? `${config.url.serverURL}${props.productImageUrl[0]}`
              : `${config.url.serverURL}${props.productImageUrl}`
          }
          alt="Oops, no image!!"
          className="product-image"
          width="150"
        />
      </div>
      <div className="product-info">
        <div className="product-name">{props.productName}</div>
        <div className="product-price-wrapper">
          <div
            className={`${
              props.offer.offerPrice !== null && props.offer.offerPrice !== ""
                ? ""
                : "product-price-solo"
            } product-price`}
            style={
              props.prepTime &&
              Object.keys(props.prepTime).length === 0 &&
              props.prepTime.constructor === Object
                ? { width: "100%" }
                : { width: "50%" }
            }
          >
            {props.currency
              ? `${props.currency} ${parseFloat(
                  props.offer.offerPrice === null ||
                    props.offer.offerPrice === ""
                    ? props.price
                    : props.offer.offerPrice
                ).toLocaleString("en", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}`
              : `₹ ${parseFloat(
                  props.offer.offerPrice === null ||
                    props.offer.offerPrice === ""
                    ? props.price
                    : props.offer.offerPrice
                ).toLocaleString("en", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}`}
          </div>
          {props.prepTime &&
          Object.keys(props.prepTime).length !== 0 &&
          props.prepTime.constructor === Object ? (
            <div
              className={`${
                props.offer.offerPrice === null || props.offer.offerPrice === ""
                  ? ""
                  : "product-prep-time-solo"
              } product-prep-time`}
            >
              <img
                src={require("../../../assets/images/Cooking_Icon.svg")}
                className="product-prep-time-icon"
              />
              <span className="product-prep-time-text">
                {props.prepTime.value} {props.prepTime.durationType}
              </span>
            </div>
          ) : null}
          <div
            className={`${
              props.offer.offerPrice !== null && props.offer.offerPrice !== ""
                ? ""
                : "hidden"
            } product-price-old`}
          >
            {props.currency
              ? `${props.currency} ${parseFloat(props.price).toLocaleString(
                  "en",
                  { maximumFractionDigits: 2, minimumFractionDigits: 2 }
                )}`
              : `₹ ${parseFloat(props.price).toLocaleString("en", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}`}
          </div>
          {/* <div className={`${props.offer.offerPrice === null || props.offer.offerPrice === '' ? '': 'hidden'} product-discount`}>
                        {
                            `(${props.discountPct ? props.discountPct : '0'}% OFF)`
                        }
                    </div> */}
        </div>
        {props.applicableOffer && props.applicableOffer.length > 0 ? 
            <div className="product-offers-container">
                <span className="product-offer-text">
                <span className="product-offer-title">Offer: </span>
                    {props.applicableOffer[0].promoDescription}
                </span>
            </div>
        : null} 
      </div>
    </div>
  );
};

export default ProductTile;