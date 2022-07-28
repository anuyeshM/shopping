import React from 'react';
import './incDecButton.css';
import plus from '../../../../assets/images/plus.svg';
import minus from '../../../../assets/images/minus.svg';

const IncDecButton = (props) => {
  return (
    <div className='inc-dec-button' onClick={props.onClick} style={props.style}>
      <img src={props.type === 'inc' ? plus : minus} alt='not found' />
    </div>
  );
};

export default IncDecButton;
