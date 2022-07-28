import React from 'react';
import Rating from 'react-rating';
import greyStar from '../../../../assets/images/myBookings/rating/greyStar.svg';
import yellowStar from '../../../../assets/images/myBookings/rating/yellowStar.svg';

const CustomRating = (props) => {
  const handleClick = (value) => {
    if (props.setRating && props.itemId)
      props.setRating(value, props.itemId, props.orderId);
    else props.setRating(value);
  };
  return (
    <Rating
      onChange={(value) => handleClick(value)}
      className='rating-style'
      style={{ ...{ width: '100%' }, ...props.style }}
      initialRating={props.rating}
      emptySymbol={<img src={greyStar} height='30pt' alt='notfound' />}
      fullSymbol={<img src={yellowStar} height='30pt' alt='notfound' />}
      placeholderRating={props.placeholderRating}
    />
  );
};

export default CustomRating;
