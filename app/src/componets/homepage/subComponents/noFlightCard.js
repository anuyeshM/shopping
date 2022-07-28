import React from 'react';
import { NavLink } from 'react-router-dom';

import '../homepage.css';

//icons
import whitePlus from '../../../assets/images/icons8-plus.svg';

const NoFlightCard = () => {
  return (
    <div className='noflights-card-container'>
      <div className='cardHeader-text'>No flights added yet</div>
      <div className='card-content'>Add a flight here to get live updates</div>

      <NavLink
        className='btn'
        to={{
          pathname: '/addNewFlight',
        }}>
        <img src={whitePlus} height='20' width='20' className='btn-icon' />
        <span className='btn-text'>Add a Flight</span>
      </NavLink>
    </div>
  );
};

export default NoFlightCard;
