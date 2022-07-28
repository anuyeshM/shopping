import React from 'react';
import { NavLink } from 'react-router-dom';
import config from '../../../commons/config';

const RecommendationTile = (props) => {
    return (
        <NavLink
            onClick={() => window.scrollTo(0, 0)}
            to={{
                pathname: `/${props.storecode}/products/detail/${props.item.itemId}`,
          }}>
            <div className='recommendation-tile'>
                <div  className='add-product add-product-img'></div>
                <div className='recommendation-tile-image-wrapper'>
                    <img className='recommendation-tile-image-wrapper'
                        src={
                        props.productImageUrl instanceof Array
                            ? `${config.url.serverURL}${props.item.productImageUrl[0]}`
                            : `${config.url.serverURL}${props.item.productImageUrl}`
                        } 
                        width="100%" 
                        height="100%" />
                </div>
                <div className='recommendation-tile-title-text'>
                    {props.item.itemLabel}
                </div>
                <div className='recommendation-tile-price'>
                    ₹ {props.item.itemPrice}
                </div>
            </div>
        </NavLink>
    )
}

export default RecommendationTile;