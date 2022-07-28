import React, { useState, useEffect, useContext } from 'react';

import './notifications.css';
import AppContext from '../../commons/context';

import NotifCard from './subComponents/notifCard';

import DummyData from './dummyResponse.json';

const Notifications = () => {
  const ClientCart = useContext(AppContext);
  const [cardData, setCardData] = useState(DummyData.data);

  useEffect(() => {
    sendDataToReactNative();
  }, []);

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        'Notification' + '-' + ClientCart.isEmpty()
      );
  }

  return (
    <div className='notifications-wrapper'>
      <div className='notifications-body-container'>
        {cardData.map((card, i) => (
          <NotifCard
            card={card}
            key={card.id}
            index={i}
            cardData={cardData}
            setCardData={setCardData}
          />
        ))}
      </div>
    </div>
  );
};

export default Notifications;
