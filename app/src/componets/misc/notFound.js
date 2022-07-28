// dependencies
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import PushAlert from "../../commons/notification";
import './misc.css';

export default function NotFound()  {
  const history = useHistory();
  
  useEffect(() => {
    PushAlert.info(`Redirecting to home page...`);

    setTimeout(() => {
      history.push('/')
    }, 3000);
  });

  return (
    <div>
      <div className='not-found-icon'></div>
      <div className='not-found'>
          <h2>Oops!!!</h2>
          <h4>Looks like the page you're trying to access is in warp....</h4>
      </div>
    </div>
  );
};