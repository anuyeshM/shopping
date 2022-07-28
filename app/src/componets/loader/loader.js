// dependencies
import React from "react";
import loader from '../../assets/images/loader.gif';
 
export default function Loader()  {
  return (
    <img src={loader} alt={"loader"} className='loader' width="100px" />
  );
};