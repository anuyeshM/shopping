import React from 'react';
import './secondaryButton.css';
const SecondaryButton = (props) => {
  return (
    <button
      className='secondaryButton centralise'
      style={props.style}
      onClick={props.onClick}>
      <h5 className='secondaryButton-text bold'>{props.children}</h5>
    </button>
  );
};

export default SecondaryButton;
