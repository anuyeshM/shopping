import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Loader from '../loader/loader';
import config from '../../commons/config';
import './paymentStyle.css';
import PushAlert from '../../commons/notification';
import { CouponContext } from '../../context/CouponProvider';

export default function PaymentLoader(props) {
  const couponContext = useContext(CouponContext);

  const history = useHistory();

  const isInvalidRequest = (req) => {
    return (
      void 0 === req ||
      void 0 === req.location ||
      void 0 === req.location.state ||
      void 0 === req.location.state.orderId ||
      '' === req.location.state.orderId
    );
  };

  useEffect(() => {
    if (isInvalidRequest(props)) {
      console.log(props.location.state);
      history.goBack();
      PushAlert.error('Session Lost...');
    } else {
      console.log(props.location.state);
      let formPath = `${config.api.makePayment}?`;
      formPath += `tokenParam=${props.location.state.tokenParam}&`;
      formPath += `orderId=${props.location.state.orderId}&`;
      formPath += `amount=${props.location.state.amount}&`;
      formPath += `payment_option=${props.location.state.payment_option}&`;
      formPath += `card_type=${props.location.state.card_type}&`;
      formPath += `card_name=${props.location.state.card_name}&`;
      formPath += `data_accept=${props.location.state.data_accept}&`;
      formPath += `card_number=${props.location.state.card_number}&`;
      formPath += `expiry_month=${props.location.state.expiry_month}&`;
      formPath += `expiry_year=${props.location.state.expiry_year}&`;
      formPath += `cvv_number=${props.location.state.cvv_number}&`;
      formPath += `issuing_bank=${props.location.state.issuing_bank}&`;
      formPath += `mobile_number=${props.location.state.mobile_number}`;

      setTimeout(() => {
        document.getElementById('customer-data').submit();
        // console.log(document.getElementById('customer-data'));
      }, 1000);
    }
  });

  return (
    <div className='payredir-container'>
      <div className='payredir-loader-wrapper'>
        <Loader />
      </div>
      <div className='payredir-message'>
        Please wait while you are redirected to secure payment page...
      </div>
      <form
        method='post'
        name='customerData'
        id='customer-data'
        action={`${config.api.makePayment}?tokenParam=${props.location.state.tokenParam}`}>
        <input
          type='hidden'
          name='orderId'
          value={props.location.state.orderId}
        />
        <input
          type='hidden'
          name='amount'
          value={props.location.state.amount}
        />
        <input
          type='hidden'
          name='payment_option'
          value={props.location.state.payment_option}
        />
        <input
          type='hidden'
          name='card_type'
          value={props.location.state.card_type}
        />
        <input
          type='hidden'
          name='card_name'
          value={props.location.state.card_name}
        />
        <input
          type='hidden'
          name='data_accept'
          value={props.location.state.data_accept}
        />
        <input
          type='hidden'
          name='card_number'
          value={props.location.state.card_number}
        />
        <input
          type='hidden'
          name='expiry_month'
          value={props.location.state.expiry_month}
        />
        <input
          type='hidden'
          name='expiry_year'
          value={props.location.state.expiry_year}
        />
        <input
          type='hidden'
          name='cvv_number'
          value={props.location.state.cvv_number}
        />
        <input
          type='hidden'
          name='issuing_bank'
          value={props.location.state.issuing_bank}
        />
        <input
          type='hidden'
          name='mobile_number'
          value={props.location.state.mobile_number}
        />
      </form>
    </div>
  );
}
