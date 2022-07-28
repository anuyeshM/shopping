import React, { useContext } from "react";
import api from "../../../commons/api";
import config from "../../../commons/config";
import PushAlert from "../../../commons/notification";
import AppContext from "../../../commons/context";

const DetailsOptionCard = (props) => {
  const ClientCart = useContext(AppContext);
  const getServInfo = async () => {
    try {
      let apiURL = `${config.api.serviceInfo}?serviceId=${props.item._id}`;
      let apiResponse = await api.get(apiURL);
      let regResponse = apiResponse;
      if (regResponse.status === 200) {
        props.setServiceInfo(regResponse.data);
        props.setModalIsLoading(false);
        props.setModalIsVisible(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  function handleSelection(id, price, currency, title, discountPercent) {
    let subData = props.details;
    for (let data of subData) {
      if (data._id == id) {
        data.selectedFlag =
          data.selectedFlag === false ? !data.selectedFlag : data.selectedFlag;
        let unitOfMeasure = [];
        data.uom.forEach((x) => {
          if (
            (x.activeFlag === "Y" || x.activeFlag === "y") &&
            (x.primaryFlag === "Y" || x.primaryFlag === "y")
          ) {
            const itemParam = {
              storecode: props.ancestorId,
              productId: id,
              flightUid: props.selectedFlightUID,
            };
            if (ClientCart.hasService(itemParam)) {
              let item = ClientCart.getItem(itemParam);
              if (item && item.itemQuantity) {
                props.setCounterValue(item.itemQuantity);
              }
            }
            props.setCounterValue(x.startValue);
            props.setCounterStartValue(x.startValue);
            props.setCounterStepValue(x.endValue);
            props.setMaxCounterValue(x.maxValue);
            props.setCounterType(x.qtyType);
            unitOfMeasure.push(x);
          }
        });
        props.setQtyDrivenFields(unitOfMeasure);
        data.addonServices.forEach((y) => {
          y.quantity = 0;
        });
        props.setAddOns(data.addonServices);
        if (data.selectedFlag === true) {
          props.setSelectedOption({
            ...props.selectedOption,
            id,
            price,
            currency,
            title,
            discountPercent,
          });
        } else {
          props.setSelectedOption({
            ...props.selectedOption,
            id: "",
            price: "",
            title: "",
            discountPercent: "",
          });
        }
      } else {
        data.selectedFlag = false;
      }
    }
    props.setDetails([...subData]);
  }

  const getApplicableFor = () => {
    if (props.item.uom.length > 0) {
      let found = props.item.uom.find(
        (ele) => ele.primaryFlag === "Y" || ele.primaryFlag === "y"
      );
      if (found) {
        if (found.qtyType === "step")
          return "/ " + found.endValue + " " + found.type;
        else return "/ " + found.type;
      } else {
        return "";
      }
    }
  };

  const removeVariant = () => {
    if (props.item.isAdded) {
      const removeParam = {
        storecode: props.ancestorId,
        productId: props.item._id,
      };
      ClientCart.removeItem(removeParam);
      let subData = props.details;
      for (let data of subData) {
        if (data._id == props.item._id) {
          data.isAdded = false;
        }
      }
      props.setDetails([...subData]);
      PushAlert.success("Item removed from cart");
      props.sendDataToReactNative();
    }
  };

  return (
    <div
      className="option-card"
      style={
        props.item.selectedFlag
          ? { backgroundColor: "#202326" }
          : { backgroundColor: "#fff" }
      }
      onClick={() =>
        handleSelection(
          props.item._id,
          props.item.pricing.length > 0
            ? props.item.pricing[0].latestGrossPrice[0].grossPrice
            : 0,
          props.item.pricing.length > 0 ? props.item.pricing[0].currency : "",
          props.item.title,
          props.item.discount_perc
        )
      }
    >
      <div
        className={
          props.item.isAdded
            ? "card-added"
            : props.item.selectedFlag
            ? "card-selected"
            : "card-unselected"
        }
        onClick={(e) => {
          if (props.item.isAdded) {
            e.stopPropagation();
            removeVariant(e);
          }
        }}
      ></div>
      <div className="card-content-container">
        <div
          style={{ maxWidth: "70%", display: "flex", alignItems: "flex-end" }}
          onClick={(e) => {
            e.stopPropagation();
            getServInfo();
          }}
        >
          <span
            className={
              props.item.selectedFlag
                ? "card-title-selected"
                : "card-title-unselected"
            }
            style={
              props.item.selectedFlag ? { color: "#fff" } : { color: "#000" }
            }
          >
            {props.item.title && props.item.title.length > 30
              ? props.item.title.substring(0, 30) + "..."
              : props.item.title}
          </span>
        </div>
        {props.item.features && props.item.features.length > 0 ? (
          <div className="card-features-container">
            {props.item.features &&
              props.item.features.map((item, index) =>
                item.featureName ? (
                  <span
                    className={
                      index === props.item.features.length - 1
                        ? "card-features-last"
                        : "card-features"
                    }
                    key={index}
                    style={
                      props.item.selectedFlag
                        ? { color: "#fff" }
                        : { color: "#000" }
                    }
                  >
                    <img
                      src={require("../../../assets/images/chek.svg")}
                      style={{
                        width: "13px",
                        height: "13px",
                        paddingRight: "7px",
                      }}
                    />
                    {item.featureName}
                  </span>
                ) : null
              )}
          </div>
        ) : null}
        <div className="card-price-container">
          <span
            className="card-price"
            style={
              props.item.selectedFlag ? { color: "#fff" } : { color: "#000" }
            }
          >
            {props.item.pricing.length > 0 && props.item.pricing[0].currency}{" "}
            {props.item.pricing.length > 0 &&
              props.item.pricing[0].latestGrossPrice[0].grossPrice.toLocaleString()}{" "}
            <span style={{ fontSize: "16px", textTransform: "none" }}>
              {getApplicableFor()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetailsOptionCard;
