import React from 'react';
import './bigIcon.css';
const BigIcon = (props) => {
  return (
    <div className='bigIcon-container'>
      <img src={props.icon} alt='notfound' className='image' />
      <h6>{props.label}</h6>
    </div>
  );
};

export default BigIcon;
