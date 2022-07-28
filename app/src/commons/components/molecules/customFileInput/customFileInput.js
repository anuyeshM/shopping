import React from 'react';
import imageUpload from '../../../../assets/images/myBookings/imageUpload.svg';
import './customFileInput.css';
import customFileInputConfig from './customFileInputConfig';
const CustomFileInput = (props) => {
  return (
    <div className='inputContainer' style={props.style}>
      <input
        type='file'
        name='file'
        id='file'
        class='inputfile'
        accept={customFileInputConfig[props.type]}
        onChange={props.changeHandler}
        multiple={props.multiple}
        capture={props.capture}
      />
      <label for='file'>{props.label}</label>
    </div>
  );
};

export default CustomFileInput;
