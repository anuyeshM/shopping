import React, { useState, useEffect, useContext } from "react";
import PushAlert from "../../../../commons/notification";
import AppContext from "../../../../commons/context";

export default function QuantityCounter({
  index,
  value,
  counterValue,
  setCounterValue,
  counterStartValue,
  maxCounterValue,
  counterStepValue,
  selectedVariant,
  pid,
  selectedOption,
  selectedFlightUID,
}) {
  const ClientCart = useContext(AppContext);
  const [counter, setCounter] = useState(counterValue);

  useEffect(() => {
    const itemParam = {
      storecode: pid,
      productId: selectedOption.id,
      flightUid: selectedFlightUID,
    };
    if (ClientCart.hasService(itemParam)) {
      let item = ClientCart.getItem(itemParam);
      if (item && item.itemQuantity) {
        setCounter(item.itemQuantity);
      }
    } else {
      setCounter(counterStartValue);
    }
  }, [selectedVariant]);

  function handleIncrement(value) {
    if (counter < maxCounterValue) {
      setCounter(counter + counterStepValue);
      // setCounterValue({ ...counterValue, [value]: counter + counterStepValue });
      setCounterValue(counter + counterStepValue);
    } else {
      PushAlert.warning("Maximum Quantity Limit Reached");
    }
  }
  function handleDecrement(value) {
    if (counter > counterStartValue) {
      setCounter(counter - counterStepValue);
      // setCounterValue({ ...counterValue, [value]: counter - counterStepValue });
      setCounterValue(counter - counterStepValue);
    }
  }
  return (
    <div className="quantity-container" key={index}>
      <div className="quantity-text">{value}</div>
      <div className="test">
        <div className="input-container">
          <input
            type="text"
            value={counter}
            className="quantity-input"
            readOnly
          />
        </div>
        <div className="button-container">
          <button
            className="decrement-button"
            onClick={() => handleDecrement(value)}
          >
            <img
              src={require("../../../../assets/images/minus.svg")}
              alt="minus"
              height={10}
              width={10}
            />
          </button>
          <button
            className="increment-button"
            onClick={() => handleIncrement(value)}
          >
            <img
              src={require("../../../../assets/images/plus.svg")}
              height={10}
              width={10}
              alt="plus"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
