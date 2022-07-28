import React, { useContext } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import AppContext from '../../commons/context';

import './headerStyle.css';

/**
 * HEADER COMPONENT
 * @param {gobackEnabled, headerText, headerTextLinkRef, rootPath, storecode} props
 */
export default function (props) {
  const ClientCart = useContext(AppContext);
  const history = useHistory();

  const goback = () => {
    if (props.isHomeScreen) {
      history.location.pathname === props.rootPath
        ? history.push('/')
        : history.goBack();
    }
    // else if (props.customNavLink !== false) {
    //   history.push(`/${props.customNavLink}`)
    // }
    else {
      history.goBack();
    }
  };

  return (
    <div className='header'>
      <div className='header-static'>
        {props.gobackEnabled ? (
          <p
            className='goto-storelisting goto-storelisting-image'
            onClick={goback}></p>
        ) : (
          ''
        )}
        {props.staticHeaderText ? (
          props.gobackEnabled ? (
            <p className='store-name'>{props.headerText}</p>
          ) : (
            <p className='airport-logo'></p>
          )
        ) : (
          <NavLink
            to={`/${props.headerTextLinkRef}`}
            style={{ textDecoration: 'none' }}>
            <p className='store-name'>{props.headerText}</p>
          </NavLink>
        )}
      </div>

      {props.amount ? (
        <div className='amount-container'>{`${props.currency}.${props.amount}`}</div>
      ) : (
        <div className='header-action'>
          {props.showScanner ? (
            <NavLink exact to={`${props.rootPath}/scanner`}>
              <div
                data-id='headerScanner'
                className='no-select header-scanner header-scanner-icon'></div>
            </NavLink>
          ) : (
            <div className='no-select header-scanner'></div>
          )}
          {props.showCart ? (
            <NavLink to={`/cart`}>
              <div
                data-id='headerCart'
                className={
                  'no-select header-cart' +
                  (ClientCart.isEmpty()
                    ? ' header-cart-empty'
                    : ' header-cart-filled')
                }></div>
            </NavLink>
          ) : (
            <div className='no-select header-cart'></div>
          )}
        </div>
      )}
    </div>
  );
}
