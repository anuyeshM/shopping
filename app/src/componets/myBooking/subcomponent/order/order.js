import React, { useEffect, useState, Fragment } from "react";
import moment from "moment";
import Card from "../card/card";
import "./order.css";
const Order = ({ orderItem, type, orderQrCode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [flightItems, setFlightItems] = useState([]);
  const [others, setOthers] = useState([]);

  useEffect(() => {
    let newFlightItems = [];
    let newOthers = [];

    orderItem.items.forEach((item) => {
      if (item.flight.id) {
        let flightFlag = false;
        //**check if array contains flight */
        newFlightItems.length &&
          newFlightItems.forEach((oldFlightItem) => {
            if (oldFlightItem.id === item.flight.id) {
              flightFlag = true;
              if (item.itemType !== "product") {
                oldFlightItem.items.push(item);
              } else {
                //**check if store already exists */
                let storeFlag = false;
                oldFlightItem.items.forEach((oldItem) => {
                  if (oldItem.storeId === item.storeId) {
                    storeFlag = true;
                    oldItem.items.push(item);
                    oldItem.itemQuantity = oldItem.itemQuantity + 1;
                  }
                });
                if (!storeFlag) {
                  oldFlightItem.items.push({
                    storeId: item.storeId,
                    itemName: item.storeName,
                    productImageUrl: item.shopBrandingImageURL
                      ? [item.shopBrandingImageURL]
                      : item.productImageUrl, //this will change to store image
                    itemType: "product",
                    variant: item.variant,
                    rating: item.rating ? item.rating : null,
                    itemQuantity: 1,
                    delivery: item.delivery,
                    flight: item.flight,
                    items: [item],
                  });
                }
              }
            }
          });
        //**if absent create new flight item */
        if (!flightFlag) {
          if (item.itemType !== "product")
            newFlightItems.push({
              id: item.flight.id,
              details: item.flight,
              items: [item],
            });
          else {
            newFlightItems.push({
              id: item.flight.id,
              details: item.flight,
              items: [
                {
                  storeId: item.storeId,
                  itemName: item.storeName,
                  productImageUrl: item.shopBrandingImageURL
                    ? [item.shopBrandingImageURL]
                    : item.productImageUrl, //this will change to store image
                  itemType: "product",
                  variant: item.variant,
                  rating: item.rating ? item.rating : null,
                  itemQuantity: 1,
                  delivery: item.delivery,
                  flight: item.flight,
                  items: [item],
                },
              ],
            });
          }
        }
      } else {
        newOthers.push({
          storeId: item.storeId,
          itemName:
            item.itemType === "product" ? item.storeName : item.itemName,
          productImageUrl: item.shopBrandingImageURL
            ? [item.shopBrandingImageURL]
            : item.productImageUrl, //this will change to store image
          itemType: item.itemType,
          variant: item.variant,
          rating: item.rating ? item.rating : null,
          itemQuantity: 1,
          delivery: item.delivery,
          items: [item],
          contact: item.contact ? item.contact : [],
          cancellationFlag: item.cancellationFlag ? item.cancellationFlag : "N",
          cancellationPolicy: item.cancellationPolicy
            ? item.cancellationPolicy
            : [],
          itemId: item.itemId ? item.itemId : "",
          orderStatus: item.orderStatus ? item.orderStatus : "",
          serviceDateTime: item.serviceDateTime ? item.serviceDateTime : null,
          serviceFeedback: item.serviceFeedback ? item.serviceFeedback : {},
          serviceProviderInfo: item.serviceProviderInfo
            ? item.serviceProviderInfo
            : {},
          statusDetails: item.statusDetails ? item.statusDetails : [],
        });
      }
    });

    setFlightItems(newFlightItems);
    setOthers(newOthers);
    setIsLoading(false);
  }, []);

  return (
    <Fragment>
      {isLoading ? null : (
        <div className="order-wrapper">
          <div className="order-header">
            <h5 className="bold">{`Order ${
              orderItem.ppgOrderId && orderItem.ppgOrderId !== ""
                ? orderItem.ppgOrderId
                : orderItem.orderId.slice(-5)
            }`}</h5>
          </div>
          {flightItems.length
            ? flightItems.map((flightItem) => (
                <Fragment key={flightItem.id}>
                  <div className="flight-detail">
                    <h6>{`For Flight ${flightItem.id} ${flightItem.details.source} to ${flightItem.details.destination}`}</h6>
                    <h6 style={{ marginLeft: "3pt" }}>{`${moment(
                      flightItem.details.estimatedDeparture
                    ).format("DD/MM/YYYY HH:mm")}`}</h6>
                  </div>
                  <div className="card-wrapper">
                    {flightItem.items.map((item, index) => (
                      <Card
                        item={item}
                        key={`${item.itemId}${index}`}
                        status={orderItem.status}
                        orderId={orderItem.orderId}
                        type={type}
                        orderQrCode={orderQrCode}
                      />
                    ))}
                  </div>
                </Fragment>
              ))
            : null}
          {others.length ? (
            <Fragment>
              <div className="flight-details">
                <h6>Others</h6>
              </div>
              {others.map((otherItem, index) => (
                <Fragment key={index}>
                  <div className="card-wrapper">
                    <Card
                      item={otherItem}
                      key={`${otherItem.itemId}${index}`}
                      status={orderItem.status}
                      orderId={orderItem.orderId}
                      type={type}
                      orderQrCode={orderQrCode}
                    />
                  </div>
                </Fragment>
              ))}
            </Fragment>
          ) : null}
        </div>
      )}
    </Fragment>
  );
};

export default Order;
