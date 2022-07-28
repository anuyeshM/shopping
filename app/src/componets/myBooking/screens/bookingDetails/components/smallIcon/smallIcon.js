import React from 'react';
import './smallIcon.css';
const SmallIcon = (props) => {
  return (
    <div className='small-icon' onClick={props.onClick}>
      <img src={props.image} alt='notfound' className='small-icon-image' />
    </div>
  );
};

export default SmallIcon;
