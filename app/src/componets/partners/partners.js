import React, { useState, useEffect, useContext } from 'react';

//misc
import Loader from '../loader/loader';
import config from '../../commons/config';
import AppContext from '../../commons/context';
import ClassificationTile from './subcomponent/classificationTile';
import PartnerCard from './subcomponent/partnerCard';
// import FB from '../../assets/images/iconFB_partners.svg';
// import Fashion from '../../assets/images/iconServicesClothing_partners.svg';
// import Travel from '../../assets/images/iconTravel_partners.svg';
// import Medical from '../../assets/images/iconMedical.svg';
// import MarriottImage from '../../assets/images/bitmap.png'
// import LeelaImage from '../../assets/images/bitmap2.png'

import './partners.css';
import api from '../../commons/api';
import Util from '../../commons/util/util';

const Partners = (props) => {
  const ClientCart = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebView] = useState(Util.isWebView());
  const [isHotelPartnersOpen, setIsHotelPartnersOpen] = useState(true);
  const [isOnlinePartnersOpen, setIsOnlinePartnersOpen] = useState(false);
  const [isOfflinePartnersOpen, setIsOfflinePartnersOpen] = useState(false);
  const [partnersData, setPartnersData] = useState({});

  useEffect(() => {
    getPartners();
    sendDataToReactNative();
  }, []);

  const getPartners = async () => {
    api
      .get(config.api.partners)
      .then((regResponse) => {
        if (
          'success' === regResponse.status &&
          200 === regResponse.statusCode
        ) {
          setPartnersData(regResponse.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        'Partners' + '-' + ClientCart.isEmpty()
      );
  }

  return (
    <div className='partners-container'>
      {isLoading ? (
        <div className='loader-container'>
          <Loader />
        </div>
      ) : (
        <div className='partners-content-container'>
          <div
            style={
              isWebView
                ? { backgroundColor: '#f7f7f7' }
                : { backgroundColor: '#f7f7f7', marginTop: '15px' }
            }>
            <div className='partners-search-filter'>
              <div
                data-id='partners-searchIcon'
                className='partners-search-icon'></div>
              <div
                data-id='partners-searchInputWrapper'
                className='partners-search-input-wrapper'>
                <input
                  type='search'
                  data-id='searchInput'
                  className='no-select search-input'
                  placeholder='Search'
                  // value={searchString}
                  // onChange={(e) => setsearchString(e.target.value)}
                  // onKeyDown={(e) => handleKeyPress(e)}
                />
              </div>
            </div>
            <div className='partners-classification-container'>
              <div
                className='partners-horz-scroll-classification'
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    4,
                    partnersData.category.length
                  )}, 5rem)`,
                }}>
                {partnersData.category.map((item, index) => (
                  <ClassificationTile
                    storecode='CCXow8ALRDrALHYGN'
                    {...item}
                    key={`classification_${index}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className='our-partners-container'>
            <span className='our-partners-header'>Our Partners</span>

            <div
              onClick={(e) => setIsHotelPartnersOpen(!isHotelPartnersOpen)}
              className='collapse-title'>
              <span className='collapse-title-text'>Hotel Partners</span>
              {isHotelPartnersOpen ? (
                <img
                  src={require('../../assets/images/iconUp.png')}
                  className='down-arrow'
                  alt='ua'
                />
              ) : (
                <img
                  src={require('../../assets/images/iconDown.png')}
                  className='down-arrow'
                  alt='da'
                />
              )}
            </div>
            {isHotelPartnersOpen ? (
              <div className='collapse-content'>
                <div className='partners-classification-container'>
                  <div
                    className='horz-scroll-partner-card'
                    style={{
                      gridTemplateColumns: `repeat(${Math.max(
                        4,
                        partnersData.hotelPartners.length
                      )}, 5rem)`,
                    }}>
                    {partnersData.hotelPartners.map((item, index) => (
                      <PartnerCard key={index} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            <div
              onClick={(e) => setIsOnlinePartnersOpen(!isOnlinePartnersOpen)}
              className='collapse-title'>
              <span className='collapse-title-text'>Online Partners</span>
              {isOnlinePartnersOpen ? (
                <img
                  src={require('../../assets/images/iconUp.png')}
                  className='down-arrow'
                  alt='ua'
                />
              ) : (
                <img
                  src={require('../../assets/images/iconDown.png')}
                  className='down-arrow'
                  alt='da'
                />
              )}
            </div>
            {isOnlinePartnersOpen ? (
              <p
                className='disabled-text collapse-content'
                style={{ marginLeft: '2rem' }}>
                Feature coming soon...
              </p>
            ) : null}
            <div
              onClick={(e) => setIsOfflinePartnersOpen(!isOfflinePartnersOpen)}
              className='collapse-title'>
              <span className='collapse-title-text'>Offline Partners</span>
              {isOfflinePartnersOpen ? (
                <img
                  src={require('../../assets/images/iconUp.png')}
                  className='down-arrow'
                  alt='ua'
                />
              ) : (
                <img
                  src={require('../../assets/images/iconDown.png')}
                  className='down-arrow'
                  alt='da'
                />
              )}
            </div>
            {isOfflinePartnersOpen ? (
              <p
                className='disabled-text collapse-content'
                style={{ marginLeft: '2rem' }}>
                Feature coming soon...
              </p>
            ) : null}
            <div className='collapse-title' />
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
