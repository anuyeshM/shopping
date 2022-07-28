import React from "react";
import { NavLink } from "react-router-dom";
import config from '../../../commons/config';

const ClassificationTile = (props) => {
    return (
        // <NavLink
        //             to={{
        //                 pathname: `/${props.storecode}/products`,
        //                 storecode: props.storecode,
        //                 categoryId: props.id ? props.id : props.label,
        //                 categoryName: props.label
        //             }}
        // >
            <div 
                data-id={props.id ? props.id : props.label} 
                className='store-classification'
                onClick={() => (window.selectedCategory = props.label)}
            >
                <div className='classification-image-wrapper'>
                    <img 
                        src={config.url.serverURL + props.imageUrl}
                        alt='No image'
                        className='classification-image' 
                        width='30' height='30'
                    />
                </div>
                <div 
                    className={
                        'store-classification-label ' + 
                        ((13 > props.label.length || 1 === props.label.split(' ').length) ? 'short-label': '')
                    }
                >
                    {props.label}
                </div>
            </div>
        // </NavLink>
    );
}

export default ClassificationTile;