import React, { useState, useEffect, useContext } from 'react';

//misc
import Loader from '../loader/loader';
import config from '../../commons/config';
import AppContext from '../../commons/context';
import Card from './subcomponent/card';
import './airportGuide.css';
import api from '../../commons/api';
import Util from '../../commons/util/util';

const AirportGuide = (props) => {
  const ClientCart = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebView] = useState(Util.isWebView());
  const [airportGuideData, setAirportGuideData] = useState([]);

  useEffect(() => {
    if (isWebView) sendDataToReactNative();
    runAirportGuideApi();
  }, []);

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        'Airport Guide' + '-' + ClientCart.isEmpty()
      );
  }

  const runAirportGuideApi = () => {
    api
      .get(config.api.airportGuide)
      .then((regResponse) => {
        setAirportGuideData(regResponse.data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className='airport-guide-container'>
      {isLoading ? (
        <div className='loader-container'>
          <Loader />
        </div>
      ) : (
        <div className='content-container'>
          <div className='card-listing-container'>
            {airportGuideData.map((item, index) => (
              <Card key={index} pos={index} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportGuide;
