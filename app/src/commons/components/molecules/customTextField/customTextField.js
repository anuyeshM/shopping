import React from 'react';
import TextField from '@material-ui/core/TextField';
import './customTextField.css';
const CustomTextField = (props) => {
  return (
    <TextField
      id='outlined-basic'
      label={false}
      variant='outlined'
      onChange={(e) => props.setValue(e.target.value)}
      value={props.value}
      placeholder={props.placeholder}
      // color='default'
      className='text-field'
      style={props.style}
      multiline={props.multiline}
      rows={props.multiline ? 4 : 1}
    />
  );
};

export default CustomTextField;
