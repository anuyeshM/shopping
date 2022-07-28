import React, { useContext, useState } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import config from '../../../commons/config';
import AppContext from '../../../commons/context';

const ProductTile = (props) => {
  const ClientCart = useContext(AppContext);

  const isProductAdded = () => {
    const itemParam = {
      storecode: props.storecode,
      productId: props.productId
    }
    return ClientCart.hasItem(itemParam);
  };

  const [isAdded] = useState(isProductAdded());

  const rootPath = useRouteMatch();
  var addedClass = isAdded ? 'remove-product-img' : 'add-product-img';
  var imageClass = `no-select add-product ${addedClass}`;

  return (
    <NavLink
      to={{
        pathname: `${rootPath.url}/detail/${props.productId}`,
        id: props.productId,
      }}
    >
      <div className="product-card">
        <div
          data-id={props.productId}
          data-price={props.price}
          data-name={props.productName}
          className={imageClass}
        ></div>
        <div className="product-image-wrapper">
          <img
            src={config.url.serverURL + props.image}
            alt="Oops, no image!!"
            className="product-image"
          />
        </div>
        <div className="product-info">
          <div className="product-name">{props.productName}</div>
          <div className='product-price-wrapper'>
            <div className='product-price' style={props.prepTime !== null ? { width: "50%" } : { width: "100%" }}>
                {props.currency 
                  ? `${props.currency} ${parseFloat(props.offer.offerPrice === null || props.offer.offerPrice === ''  ? props.price : props.offer.offerPrice).toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                  : `₹ ${parseFloat(props.offer.offerPrice === null || props.offer.offerPrice === ''  ? props.price : props.offer.offerPrice).toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
            </div>
            {props.prepTime !== null ?
              <div className={`${props.offer && props.offer.offerPrice !== null && props.offer.offerPrice !== '' ? '' : 'product-prep-time-solo'} product-prep-time`}>
                <img src={require('../../../assets/images/Cooking_Icon.svg')} className='product-prep-time-icon' />
                <span className='product-prep-time-text'>{props.prepTime.value} {props.prepTime.durationType}</span>
              </div>
            : null}
            <div className={`${props.offer.offerPrice !== null && props.offer.offerPrice !== '' ? '': 'hidden'} product-price-old`}>
              {props.currency
                ? `${props.currency} ${parseFloat(props.price).toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                : `₹ ${parseFloat(props.price).toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
            </div>
            {/* <div className={`${props.offer.offerPrice !== null && props.offer.offerPrice !== '' ? '': 'hidden'} product-discount`}>
              {`(${props.discountPct ? props.discountPct : '0'}% OFF)`}
            </div> */}
          </div>
          {props.applicableOffer && props.applicableOffer.length > 0 ? 
            <div className='product-offers-container'>
                <span className='product-offer-text'>
                  <span className='product-offer-title'>Offer: </span> 
                  {props.applicableOffer[0].promoDescription}
                </span>
            </div>
          : null}
        </div>
      </div>
    </NavLink>
  );
};

export default ProductTile;
