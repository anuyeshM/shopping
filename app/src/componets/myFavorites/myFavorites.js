import React, { useEffect, useContext } from 'react';

//misc
import AppContext from '../../commons/context';
import './myFavorites.css';
import Util from '../../commons/util/util';

const MyFavorites = (props) => {
  const ClientCart = useContext(AppContext);

  useEffect(() => {
    if (Util.isWebView()) sendDataToReactNative();
  }, []);

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        'My Favourite’s' + '-' + ClientCart.isEmpty()
      );
  }

  return <div className='myFavorites-container'></div>;
};

export default MyFavorites;
