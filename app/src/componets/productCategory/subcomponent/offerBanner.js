import React from "react";
import { NavLink } from "react-router-dom";
import config from '../../../commons/config';

const OfferBanner = (props) => {
    return (
        <div data-id={props.id} className='store-offer'>
            <img 
                src={props.imageUrlLink} 
                alt='Oops, no image!!'
                className='offer-image'
                width="250" 
                height="150"
            />
        </div>
    );
}

export default OfferBanner;