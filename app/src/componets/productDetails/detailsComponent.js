// dependencies
import React, { useState, useEffect, useContext } from "react";
import $ from "jquery";
import { useHistory, useParams } from "react-router-dom";
// import { Swiper, SwiperSlide } from 'swiper/react';
// import SwiperCore, { Pagination } from 'swiper';

// new swiper component
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

// local dependencies
import Loader from "../loader/loader";
import config from "../../commons/config";
import PushAlert from "../../commons/notification";
import AttributePicker from "./subcomponent/attributePicker";
import detailsCtrl from "./detailsCtrl";
import RecommendationTile from "./subcomponent/recommendationTile";
import api from "../../commons/api";

// style bundle
import "swiper/swiper-bundle.css";
import "./detailsStyle.css";
import AppContext from "../../commons/context";
import { Context as DeliveryContext } from "../../context/DeliveryOptionsContext";
import { Context as PromoContext } from "../../context/PromoContext";
import { Context as AuthContext } from "../../context/AuthContext";

//SwiperCore.use([Pagination]);

export default function Products(props) {
  const ClientCart = useContext(AppContext);
  const { state: promoState } = useContext(PromoContext);
  const { state: authState } = useContext(AuthContext);
  const history = useHistory();
  const params = useParams();
  const { state: deliveryState, removeSelectedDelivery } =
    useContext(DeliveryContext);

  const refItemQuantity =
    props.location.state && props.location.state.itemQty
      ? +props.location.state.itemQty
      : 1;
  const [storecode] = useState(props.storecode);
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [masterVariant, setMasterVariant] = useState({});
  const [defaults, setDefaults] = useState({});
  const [productOpen, setProductOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [counterValue, setCounterValue] = useState(refItemQuantity);
  const [spaceBetween, setSpaceBetween] = useState(null);
  const [addOnes, setAddOnes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  let pid = params.prodId || props.location.id;

  const leftCurve = {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  };
  const rightCurve = {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  };

  useEffect(() => {
    let cart = ClientCart.getCart();
    let updatedAddOns = addOnes;
    if (isAdded) {
      cart[storecode].items.forEach((x) => {
        if (x.itemId === pid) {
          setCounterValue(x.itemQuantity);
          if (x.addOn.length > 0) {
            x.addOn.forEach((y) => {
              updatedAddOns.forEach((z) => {
                if (y.addonId === z.addonId) {
                  z.quantity = y.quantity;
                }
              });
            });
            setAddOnes([...updatedAddOns]);
          }
        }
      });
    }
  }, [isAdded]);

  function getAttributes($) {
    const $root = $(document);
    let attributes = [];

    $.each($root.find(".picker"), function () {
      var $me = $(this);

      attributes.push({
        type: $me.attr("data-type"),
        value: $me.val(),
      });
    });

    return attributes;
  }

  function getProductInfo(params, $, History) {
    api
      .post(config.api.productId, {
        ...params,
        attributes: getAttributes($),
      })
      .then((response) => {
        if (
          !(
            void 0 === response ||
            void 0 === response.data ||
            void 0 === response.data.productId ||
            "" === response.data.productId ||
            " " === response.data.productId
          )
        ) {
          if (params.productId !== response.data.productId) {
            History.push(
              `/${params.shopId}/products/detail/${response.data.productId}`
            );
          }
        } else {
          PushAlert.error("Item Variant not available...");
        }

        let selectedAddOns = [];
        addOnes.forEach((x) => {
          if (x.quantity > 0) {
            selectedAddOns.push(x);
          }
        });

        const itemParam = {
          storecode: props.storecode,
          productId: params.productId,
          addOn: addOnes,
        };
        setIsAdded(ClientCart.hasItem(itemParam));
      })
      .catch((err) => {
        PushAlert.error(
          `We couldn't verify if the selected item is available...`
        );
      });
  }

  useEffect(() => {
    function getProductDetails() {
      let ruleId = [];
      promoState.applicablePromo &&
        promoState.applicablePromo.forEach((x) => {
          if (x["call-at"] === "ONCART") {
            ruleId = x.rule_id;
          }
        });
      api
        .post(config.api.productDetails, {
          itemId: pid,
          rule_id: ruleId,
          customer: authState.accountID,
        })
        .then((response) => {
          if (detailsCtrl.isInValidPayload(response)) {
            throw Error;
          } else {
            if (!response.data.pDetails.quantity) {
              setCounterValue(0);
              PushAlert.warning(
                "Item Unavailable!!! It seems someone grabbed it already..."
              );
            }

            let ds = {};
            response.data.pDetails.productVariants.forEach(
              (x) => (ds[x.type] = x.value[0])
            );

            setDefaults(ds);
            setSpaceBetween(
              response.data.pDetails.productImageUrl.length > 1 ? -40 : null
            );
            setDetails(response.data.pDetails);
            setMasterVariant(response.data.masterVariants);
            setRecommendations(response.data.recomendation);
            if (response.data.pDetails.addons) {
              response.data.pDetails.addons.forEach(function (element) {
                element.quantity = 0;
              });
              setAddOnes(response.data.pDetails.addons);
            } else setAddOnes([]);
            setIsLoading(false);

            let selectedAddOns = [];
            addOnes.forEach((x) => {
              if (x.quantity > 0) {
                selectedAddOns.push(x);
              }
            });

            setIsAdded(
              ClientCart.hasItem({
                storecode: props.storecode,
                productId: response.data.pDetails._id,
                addOn: response.data.pDetails.addons,
              })
            );
          }
        })
        .catch((err) => {
          console.log(err);
          PushAlert.error(`Oops!!! Item doesn't exist in records...`);
          setTimeout(() => {
            history.goBack();
          }, 2000);
        });
    }

    pid && getProductDetails();
  }, [storecode, pid]);

  useEffect(() => {
    sendDataToReactNative();
  }, [window.store, isAdded]);

  function sendDataToReactNative() {
    if (window.ReactNativeWebView && window.store) {
      window.ReactNativeWebView.postMessage(
        window.store.storename +
          "-" +
          ClientCart.isEmpty() +
          "-" +
          props.storecode
      );
    }
  }

  function handleIncrement() {
    const currQty = Math.min(
      details.quantity ? details.quantity : 0,
      counterValue + 1
    );

    setCounterValue(currQty);

    if (isAdded) {
      const updateParam = {
        storecode: props.storecode,
        productId: pid,
        quantity: currQty,
      };
      ClientCart.updateItem(updateParam);
    }
  }

  function handleDecrement() {
    counterValue > 1 && setCounterValue(counterValue - 1);
    if (isAdded && counterValue > 1) {
      const updateParam = {
        storecode: props.storecode,
        productId: pid,
        quantity: counterValue - 1,
      };
      ClientCart.updateItem(updateParam);
    }
  }

  function handleAddOnDecrement(id) {
    let subData = addOnes;
    for (let data of subData) {
      if (data.addonId == id && data.quantity > 0) {
        data.quantity = data.quantity - 1;
        break;
      }
    }
    setAddOnes([...subData]);

    let selectedAddOns = [];
    addOnes.forEach((x) => {
      if (x.quantity > 0) {
        selectedAddOns.push(x);
      }
    });
    const updateParam = {
      storecode: props.storecode,
      productId: pid,
      addOn: selectedAddOns,
    };
    ClientCart.updateSelectedAddon(updateParam);
  }

  function handleAddOnIncrement(id) {
    let subData = addOnes;
    for (let data of subData) {
      if (data.addonId == id) {
        if (data.quantity < 3) data.quantity = data.quantity + 1;
        else PushAlert.error(`Cannot add more than 3`);
        break;
      }
    }
    setAddOnes([...subData]);

    let selectedAddOns = [];
    addOnes.forEach((x) => {
      if (x.quantity > 0) {
        selectedAddOns.push(x);
      }
    });
    const updateParam = {
      storecode: props.storecode,
      productId: pid,
      addOn: selectedAddOns,
    };
    ClientCart.updateSelectedAddon(updateParam);
  }

  function getTotalPrice(productPrice, counterValue) {
    let val = 0;
    let addOnPrice = 0;
    addOnes.forEach((x) => {
      if (x.quantity > 0) {
        addOnPrice = addOnPrice + x.quantity * x.unitPrice;
      }
    });
    val = (productPrice + addOnPrice) * counterValue;
    return val;
  }

  const addCartEvent = (event) => {
    if (!(details.quantity || 0 === details.quantity)) {
      PushAlert.error("Product unavailable...");
    } else {
      let selectedAddOns = [];
      addOnes.forEach((x) => {
        if (x.quantity > 0) {
          selectedAddOns.push(x);
        }
      });

      const $root = $(document);
      const itemId = details._id;
      const itemPrice = details.priceAftDiscount * counterValue;
      const itemLabel = details.productName;
      const itemQuantity = counterValue;
      const maxQuantity = details.quantity;
      const itemType = details.type;
      let flightId = "";
      let flightUid = "";
      const addOn = selectedAddOns;

      let storeItems = ClientCart.getStoreItems(props.storecode);
      storeItems.forEach((element) => {
        if (element.flightId) {
          flightId = element.flightId;
          flightUid = element.flightUid;
        }
      });

      if (isAdded) {
        const removeParam = {
          storecode: props.storecode,
          storename: details.brand,
          productId: itemId,
        };
        ClientCart.removeItem(removeParam);
        if (!ClientCart.getStoreItems(props.storecode).length)
          removeSelectedDelivery(
            props.storecode,
            deliveryState.selectedDeliveryData
          );
        addOnes.forEach(function (element) {
          element.quantity = 0;
        });
        setCounterValue(1);
        PushAlert.success("Item removed from cart");
        setIsAdded(!isAdded);
      } else {
        let addParam = {};
        if (flightId === "") {
          addParam = {
            storecode: props.storecode,
            storename: details.brand,
            item: {
              itemId,
              itemQuantity,
              itemType,
              addOn,
              flightId: "",
              flightUid: "",
              // itemLabel,
              // itemPrice,
              // maxQuantity,
            },
          };
        } else {
          addParam = {
            storecode: props.storecode,
            storename: details.brand,
            item: {
              itemId,
              itemQuantity,
              itemType,
              flightId,
              flightUid,
              addOn,
              // itemLabel,
              // itemPrice,
              // maxQuantity,
            },
          };
        }
        if (ClientCart.addItem(addParam)) {
          PushAlert.success("Item successfully added to cart");
          setIsAdded(!isAdded);
        }
      }

      if (ClientCart.isEmpty()) {
        $root.find('[data-id="headerCart"]').addClass("header-cart-empty");
        $root.find('[data-id="headerCart"]').removeClass("header-cart-filled");
      } else {
        $root.find('[data-id="headerCart"]').addClass("header-cart-filled");
        $root.find('[data-id="headerCart"]').removeClass("header-cart-empty");
      }
    }
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <div style={{ textAlign: "center", paddingTop: "4rem" }}>
          <Loader />
        </div>
      ) : (
        <div className="product-details">
          <div className="container">
            <div className="swiper">
              {isLoading ? null : (
                <Carousel
                  className="carousal-cont"
                  showArrows={false}
                  showThumbs={false}
                  showIndicators={false}
                  showStatus={false}
                >
                  {details.productImageUrl.map((item, index) => (
                    <div
                      key={index}
                      style={
                        details.productImageUrl.length > 1
                          ? { marginRight: 20 }
                          : null
                      }
                    >
                      <img
                        src={config.url.serverURL + item}
                        //src={item}
                        alt="Oops, no image!!"
                        style={
                          0 === index
                            ? 1 === details.productImageUrl.length
                              ? { ...leftCurve, ...rightCurve }
                              : leftCurve
                            : index === details.productImageUrl.length - 1
                            ? rightCurve
                            : null
                        }
                        className="swiper-image"
                      />
                    </div>
                  ))}
                </Carousel>
              )}
            </div>
            <div className="product-details-content">
              <div className="rating-container">
                <div className="rating-display"></div>
                <div className="fav">
                  <img
                    src={require("../../assets/images/shareIcon.svg")}
                    alt="Share Product"
                    onClick={detailsCtrl.copyToClipboard}
                  />
                </div>
              </div>
              <div className="product-title-container">
                <div className="product-title">{details.productName}</div>
                <div className="product-title-info">{details.handle}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                {isLoading
                  ? null
                  : masterVariant.productVariants.map((item, index) => (
                      <AttributePicker
                        item={item}
                        key={`pv_${index}`}
                        shopId={storecode}
                        productId={details._id}
                        ancestors={details.ancestors}
                        defaults={defaults}
                        elem={$}
                        history={history}
                        onChange={getProductInfo}
                      />
                    ))}
              </div>
              <div className="quantity-container" style={{ marginBottom: 20 }}>
                <div className="quantity-text">Quantity:</div>
                <div className="test">
                  <div className="input-container">
                    <input
                      type="text"
                      value={counterValue}
                      className="quantity-input"
                      readOnly
                    />
                  </div>
                  <div className="button-container">
                    <button
                      className="decrement-button"
                      onClick={() => handleDecrement()}
                    >
                      <img
                        src={require("../../assets/images/minus.svg")}
                        alt="minus"
                        height={10}
                        width={10}
                      />
                    </button>
                    <button
                      className="increment-button"
                      onClick={() => handleIncrement()}
                    >
                      <img
                        src={require("../../assets/images/plus.svg")}
                        height={10}
                        width={10}
                        alt="plus"
                      />
                    </button>
                  </div>
                </div>
              </div>
              {addOnes.length > 0 ? (
                <div
                  className="quantity-container"
                  style={{ marginBottom: 20 }}
                >
                  <div className="add-on-text">Add On:</div>
                  {addOnes.map((item, index) => (
                    <div key={index} className="add-on-item-container">
                      <div className="add-on-item-text">{item.type}</div>
                      <div className="add-on-input-container">
                        <input
                          type="text"
                          value={item.quantity}
                          className="add-on-input"
                          readOnly
                        />
                      </div>
                      <div className="add-on-button-container">
                        <button
                          className="add-on-decrement-button"
                          onClick={() => handleAddOnDecrement(item.addonId)}
                        >
                          <img
                            src={require("../../assets/images/minus.svg")}
                            alt="minus"
                            height={10}
                            width={10}
                          />
                        </button>
                        <button
                          className="add-on-increment-button"
                          onClick={() => handleAddOnIncrement(item.addonId)}
                        >
                          <img
                            src={require("../../assets/images/plus.svg")}
                            height={10}
                            width={10}
                            alt="plus"
                          />
                        </button>
                      </div>
                      <div className="add-on-item-text">
                        {"₹" +
                          `${item.unitPrice}`.toLocaleString("en", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {details.applicableOffers &&
              details.applicableOffers.length > 0 ? (
                <div className="offersContainer">
                  <div className="offerModalContent">
                    <div className="offerModalTitleContainer">
                      <div className="offers-icon"></div>
                      <span className="offerModalTitle">Available Offer:</span>
                    </div>
                    <div className="offersListContainer">
                      {details.applicableOffers.map((item, index) => (
                        <div className="offersListWrapper" key={index}>
                          <div className="offersListIcon"></div>
                          <div className="offerListItem">
                            <span className="offerProdName">{item.item}</span>
                            <span className="offerName">
                              {item.promoDescription}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="info-container">
                <img
                  className="info-image"
                  src={require("../../assets/images/promo-icon.png")}
                  align="left"
                  alt="info"
                />
                <div>Shop & Get 10% Off with Code: SHOP10 Redeem</div>
              </div>
            </div>
            <div>
              <div>
                <div
                  onClick={(e) => setProductOpen(!productOpen)}
                  className="collapse-title"
                >
                  <span className="collapse-title-text">Product Details</span>
                  {productOpen ? (
                    <img
                      src={require("../../assets/images/iconUp.png")}
                      className="down-arrow"
                      alt="ua"
                    />
                  ) : (
                    <img
                      src={require("../../assets/images/iconDown.png")}
                      className="down-arrow"
                      alt="da"
                    />
                  )}
                </div>
                {productOpen ? (
                  <div className="collapse-content">
                    <p>{details.description}</p>
                    <div
                      className={`${details.type ? "" : "hidden"} details-meta`}
                    >
                      <b>Type:</b> {details.type}
                    </div>
                    <div
                      className={`${
                        details.material ? "" : "hidden"
                      } details-meta`}
                    >
                      <b>Material:</b> {details.material}
                    </div>
                    <div
                      className={`${
                        details.originCountry ? "" : "hidden"
                      } details-meta`}
                    >
                      <b>Country of Origin:</b> {details.originCountry}
                    </div>
                  </div>
                ) : null}
              </div>
              <div>
                <div
                  onClick={(e) => setPaymentOpen(!paymentOpen)}
                  className="collapse-title"
                >
                  <span className="collapse-title-text">Payment & Return</span>
                  {paymentOpen ? (
                    <img
                      src={require("../../assets/images/iconUp.png")}
                      className="down-arrow"
                      alt="ua"
                    />
                  ) : (
                    <img
                      src={require("../../assets/images/iconDown.png")}
                      className="down-arrow"
                      alt="da"
                    />
                  )}
                </div>
                {paymentOpen ? (
                  <p className="disabled-text collapse-content">
                    Feature coming soon...
                  </p>
                ) : null}
              </div>

              <div>
                <div
                  onClick={(e) => setRatingOpen(!ratingOpen)}
                  className="collapse-title"
                >
                  <span className="collapse-title-text">Rating & Reviews</span>
                  {ratingOpen ? (
                    <img
                      src={require("../../assets/images/iconUp.png")}
                      className="down-arrow"
                      alt="ua"
                    />
                  ) : (
                    <img
                      src={require("../../assets/images/iconDown.png")}
                      className="down-arrow"
                      alt="da"
                    />
                  )}
                </div>
                {ratingOpen ? (
                  <p className="disabled-text collapse-content">
                    Feature coming soon...
                  </p>
                ) : null}
              </div>

              <div>
                <div className="collapse-title">
                  <span className="collapse-title-text">People Also View</span>
                  {true ? (
                    <div
                      className="collapse-content"
                      style={{ paddingTop: "15px", fontWeight: "normal" }}
                    >
                      <div className="classification-container">
                        <div
                          className="horz-scroll-partner-card"
                          // style={{
                          //   gridTemplateColumns: `repeat(${Math.max(
                          //     5,
                          //     4,
                          //   )}, 5rem)`,
                          // }}
                        >
                          {recommendations &&
                            recommendations.map((item, index) => (
                              <RecommendationTile
                                key={index}
                                item={item}
                                storecode={storecode}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="disabled-text collapse-content"
                      style={{ paddingTop: "15px", fontWeight: "normal" }}
                    >
                      Feature coming soon...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="details-action-wrapper">
            <div className="details-price-summary">
              <div
                className={`${
                  details.offer.offerPrice === null ||
                  details.offer.offerPrice === ""
                    ? "total-price-solo"
                    : ""
                } total-price`}
              >
                {`${details.currency ? details.currency : "₹"} ${parseFloat(
                  getTotalPrice(
                    details.offer.offerPrice === null ||
                      details.offer.offerPrice === ""
                      ? details.price
                      : details.offer.offerPrice,
                    counterValue
                  )
                ).toLocaleString("en", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}`}
              </div>
              <div
                className={`${
                  details.offer.offerPrice === null ||
                  details.offer.offerPrice === ""
                    ? "hidden"
                    : ""
                } total-price-old`}
              >
                {`${details.currency ? details.currency : "₹"} ${parseFloat(
                  getTotalPrice(details.price, counterValue)
                ).toLocaleString("en", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}`}
              </div>
              {/* <div
                className={`${
                  0 === details.discountPct ? 'hidden' : ''
                } total-price-discount`}>
                {`(${details.discountPct ? details.discountPct : '0'}% OFF)`}
              </div> */}
            </div>
            <div className="details-action">
              <button
                className={`${!details.quantity ? "disabled" : ""} cart-button`}
                onClick={addCartEvent}
              >
                {isAdded ? "Remove Item" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
