import React from 'react';
import './smallModal.css';

import arrowBigDown from '../../../../assets/images/arrowBigDown.svg';

const SmallModal = (props) => {
  return (
    <div className='small-modal'>
      <div
        className={`${
          props.isOpen
            ? 'small-modal small-effect-3 small-show'
            : 'small-modal small-effect-3'
        }`}
        id='modal-3'>
        <div className={`small-content small-content-container`}>
          <div
            className='small-close-line-container'
            draggable={true}
            onDrag={() => props.setIsOpen(false)}
            onClick={() => props.setIsOpen(false)}>
            <span className='small-close-line'></span>
            {/* <img
              src={arrowBigDown}
              alt=''
              width='22pt'
              className='rate-backImage'
              onClick={() => props.setIsOpen(false)}
            /> */}
          </div>
          {/* <div className='small-header'>
            <img
              src={arrowLeft}
              alt=''
              width='22pt'
              className='rate-backImage'
              onClick={() => props.setIsOpen(false)}
            />
            <h5 className='bold rate-text'></h5>
          </div> */}
          {props.children}
        </div>
      </div>
      <div className='small-overlay'></div>
    </div>
  );
};

export default SmallModal;
