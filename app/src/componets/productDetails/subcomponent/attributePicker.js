import React from 'react';

export default function AttributePicker(props) {
  const { item } = props;
  
  return (
    <div>
      {('Y' === item.isVisible || 'y' === item.isVisible) && item.type ? (
        <div className="product-metrics-container">
          <div className="product-size">{item.type}:</div>
          <select 
            value={props.defaults[item.type]}
            data-type={item.type}
            className="picker" 
            onChange={
              e => props.onChange({
                shopId: props.shopId,
                productId: props.productId,
                ancestorsId: props.ancestors,
              }, props.elem, props.history)
            }>
              {
                item.value.map((option, index) => (
                  <option
                    value={option}
                    key={`opt_${index}`}
                    data-type={item.type}
                    // className="picker-option"
                  >
                    {option}
                  </option>
                ))
              }
          </select>
        </div>
      ) : null}
    </div>
  );
}
