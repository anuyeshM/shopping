import React from 'react';
import './primaryButton.css';
const PrimaryButton = (props) => {
  return (
    <button
      className='primaryButton centralise'
      style={props.style}
      onClick={props.onClick}>
      <h5 className='primaryButton-text bold'>{props.children}</h5>
    </button>
  );
};

export default PrimaryButton;
