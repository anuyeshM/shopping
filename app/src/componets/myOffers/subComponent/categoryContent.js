import React, { useState, useEffect } from 'react';
import config from '../../../commons/config';
import api from '../../../commons/api';

export default function CategoryContent({
  categoryName,
  storeCategories,
  setStoreCategories,
}) {
  const [offerCards, setOfferCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOffers(categoryName.label);
  }, []);

  async function getOffers(categoryName) {
    setIsLoading(true);
    let shoptype = [];
    if (categoryName && categoryName !== 'New' && categoryName !== 'All')
      shoptype.push(categoryName);

    api
      .post(config.api.getOffers, { shoptype })
      .then((data) => {
        if (data.data) {
          setOfferCards(data.data);
          setIsLoading(false);

          if (!data.data.length) {
            let localAr = storeCategories;
            localAr.forEach((item) => {
              if (categoryName === item.label) {
                item.disabled = true;
              }
            });
            setStoreCategories(localAr);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className='myOffers-content'>
      {offerCards.length ? (
        offerCards.map((item, index) => (
          <div className='myOffers-cards-wrapper' key={index}>
            {item.sponsorName ? (
              <div className='banner-header'>
                <div>{item.title}</div>
                <div style={{ marginTop: '2pt', fontSize: '10pt' }}>
                  {item.sponsorName}
                </div>
              </div>
            ) : null}
            <div className='offer-card-container' key={item._id}>
              <img
                src={item.imageUrlLink}
                height='100%'
                width='100%'
                style={{ borderRadius: '16pt' }}
                alt='No Image Found'
              />
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          No Offers Found!
        </div>
      )}
    </div>
  );
}
