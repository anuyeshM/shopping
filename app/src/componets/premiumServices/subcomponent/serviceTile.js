import React, { useContext, useState, useEffect } from "react";
import { NavLink, useRouteMatch, useHistory } from "react-router-dom";
import config from "../../../commons/config";
import AppContext from "../../../commons/context";
import $ from "jquery";
import PushAlert from "../../../commons/notification";
import { Context as FlightContext } from "../../../context/FlightsContext";

const ServiceTile = (props) => {
  const $root = $(document);
  const history = useHistory();
  const { state: flightState } = useContext(FlightContext);
  const ClientCart = useContext(AppContext);
  const [isAdded, setIsAdded] = useState(false);
  let cart = {};

  useEffect(() => {
    isProductAdded();
    if (ClientCart.isEmpty()) {
      $root.find('[data-id="headerCart"]').addClass("header-cart-empty");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-filled");
    } else {
      $root.find('[data-id="headerCart"]').addClass("header-cart-filled");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-empty");
    }
  }, [props.serviceId, props.selFlightId]);

  const isProductAdded = () => {
    cart = ClientCart.getCart();
    let prodAdded = false;
    if (
      cart &&
      cart[props.serviceId] &&
      cart[props.serviceId].items.length > 0
    ) {
      cart[props.serviceId].items.map((ele) => {
        prodAdded = ele.flightId === props.selFlightId ? true : false;
      });
    }
    setIsAdded(prodAdded);
    props.setIsServiceAdded(prodAdded);
  };

  const deleteService = (serviceId) => {
    const itemParam = {
      storecode: serviceId,
    };
    ClientCart.removeService(itemParam);
    setIsAdded(!isAdded);
    props.setIsServiceAdded(!props.isServiceAdded);

    PushAlert.success("Item removed from cart");
    if (ClientCart.isEmpty()) {
      $root.find('[data-id="headerCart"]').addClass("header-cart-empty");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-filled");
    } else {
      $root.find('[data-id="headerCart"]').addClass("header-cart-filled");
      $root.find('[data-id="headerCart"]').removeClass("header-cart-empty");
    }
  };

  function goToServiceDetails(serviceId, title) {
    let selectedFlightId = props.selFlightId;
    let selectedFlightUID = props.selFlightUID;
    let flightMappingFlag = props.serviceFlightMapping;
    if (flightMappingFlag === "Y" || flightMappingFlag === "y") {
      if (flightState.flightData.length > 0) {
        // if (!isAdded) {
        if (props.packageFlag) {
          history.push({
            pathname: `${rootPath.url}/packageDetail/${props.serviceId}`,
            state: {
              serviceId,
              title,
              selectedFlightId,
              selectedFlightUID,
              flightMappingFlag,
            },
          });
        } else {
          history.push({
            pathname: `${rootPath.url}/serviceDetail/${props.serviceId}`,
            state: {
              serviceId,
              title,
              selectedFlightId,
              selectedFlightUID,
              flightMappingFlag,
            },
          });
          // }
        }
      } else {
        props.handleClickOpen();
      }
    } else {
      // if (!isAdded) {
      if (props.packageFlag) {
        history.push({
          pathname: `${rootPath.url}/packageDetail/${props.serviceId}`,
          state: {
            serviceId,
            title,
            selectedFlightId,
            selectedFlightUID,
            flightMappingFlag,
          },
        });
      } else {
        history.push({
          pathname: `${rootPath.url}/serviceDetail/${props.serviceId}`,
          state: {
            serviceId,
            title,
            selectedFlightId,
            selectedFlightUID,
            flightMappingFlag,
          },
        });
        // }
      }
    }
  }

  const rootPath = useRouteMatch();
  var addedClass = "add-service-img";
  var imageClass = `no-select add-service ${addedClass}`;

  return (
    <div
      className="service-card"
      onClick={() => goToServiceDetails(props.serviceId, props.title)}
      style={
        props.index % 2 === 0 ? { marginRight: "10px" } : { marginRight: "0px" }
      }
    >
      <div
        data-id={props.serviceId}
        data-price={props.price}
        data-name={props.description}
        className={imageClass}
        // onClick={() => (isAdded ? deleteService(props.serviceId) : null)}
      ></div>
      <div className="service-image-wrapper">
        <img
          src={props.image}
          alt="Oops, no image!!"
          className="service-image"
        />
      </div>
      <div className="service-info">
        <div className="service-price">
          {props.title && props.title.length > 15
            ? props.title.substring(0, 15) + "..."
            : props.title}
        </div>
      </div>
    </div>
  );
};

export default ServiceTile;
