import React from 'react';

const Card = (props) => {
    console.log("From card", props.pos);
    return (
        <div className="card" style={{ marginRight: props.pos % 2 === 0 ? "10pt" : "0pt" }}>
            <div className='card-top-container'>
                <div className='card-icon-container'>
                    <img 
                        src={props.item.icon}
                        width="32pt"
                        height="32pt"
                    />
                </div>
                <div className='card-title-container'>
                    <span className='card-title-text'>{props.item.title}</span>
                </div>
            </div>
            <div className='card-desc-container'>
                <span className='card-desc-text'>{props.item.subHeader}</span>
            </div>
        </div>
    );
};

export default Card;
