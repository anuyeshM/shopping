// dependencies
import React, { useEffect, useState } from 'react';
import Util from '../../commons/util/util';

import './misc.css';

var switchToAppDefault = true;

export default function SwitchToApp() {
  const [switchToggle, setSwitchToggle] = useState(switchToAppDefault);
  const [isWebView] = useState(Util.isWebView());

  useEffect(() => {}, [switchToggle]);

  const gotoApp = () => {
    return;
    /*
        if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
            window.location.href = 
                'https://play.google.com/store/apps/details?id=com.google.android.youtube';

        } else if(
            (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) ||
            (navigator.userAgent.toLowerCase().indexOf("mac os") > -1)
            ){
            window.location.href = 
                'https://apps.apple.com/app/id544007664';
        }
        */
  };

  const gotoWeb = () => {
    switchToAppDefault = false;
    setSwitchToggle(switchToAppDefault);
  };

  return (
    <div data-id='s2a' style={isWebView ? { display: 'none' } : null}>
      {switchToggle && (
        <div data-id='s2aContainer' className='s2a-container'>
          <div className='s2a-header'>
            <div className='s2a-icon'></div>
            <div className='s2a-text'>
              <p>Use PAX App for better experience</p>
            </div>
          </div>
          <div className='s2a-content'>
            <div
              data-id='g2app'
              className='disabled option option-app'
              onClick={gotoApp}>
              Download PAX App
            </div>
            <div
              data-id='g2web'
              className='option option-web'
              onClick={gotoWeb}>
              Continue on web
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
