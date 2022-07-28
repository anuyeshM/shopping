import React from 'react';
import config from '../../../commons/config';

const PartnerCard = (props) => {
    return (
        <div className='partner-card'>
            <div className='partner-card-image-wrapper'>
                <img src={config.url.serverURL + props.item.partnerImageUrl} />
            </div>
            <div className='card-title-text'>
                {props.item.partnerName}
            </div>
            <div className='card-desc-text'>
                {props.item.partnerDesc}
            </div>
        </div>
    )
}

export default PartnerCard;