import moment from 'moment';
import React from 'react';

import './flightBand.css';
const FlightBand = (props) => {
  return (
    <div className='flight-band'>
      <h6>{`For Flight ${props.id} ${props.source} to ${props.destination}`}</h6>
      <h6 style={{ marginLeft: '3pt' }}>{`${moment(
        props.estimatedDeparture
      ).format('DD/MM/YYYY HH:mm')}`}</h6>
    </div>
  );
};

export default FlightBand;
