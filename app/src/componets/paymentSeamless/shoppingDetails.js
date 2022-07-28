import React, { useEffect, useState, useContext } from 'react';
import { useRouteMatch, useHistory, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import Checkbox from '@material-ui/core/Checkbox';
import moment from 'moment';
import validator from 'validator';
import creditCardType from 'credit-card-type';

//components
import Header from '../header/headerComponent';

//util
import AppContext from '../../commons/context';
import config from '../../commons/config';
import PushAlert from '../../commons/notification';

//media
import './modal.css';
import DummyData from './dummyJson.json';

import './paymentSeamless.css';
import api from '../../commons/api';
import webTokenConfig from '../../commons/util/webTokenConfig';
import guestTokenConfig from '../../commons/util/guestTokenConfig';
import Util from '../../commons/util/util';

const GreenRadio = withStyles({
  root: {
    color: '#47b896',
    '&$checked': {
      color: '#47b896',
    },
  },
  checked: {},
})((props) => <Radio color='default' {...props} />);

const GreenCheckbox = withStyles({
  root: {
    color: '#47b896',
    borderRadius: '8pt',
    '&$checked': {
      color: '#47b896',
    },
  },
  checked: {},
})((props) => <Checkbox color='default' {...props} />);

const ShoppingDetails = (props) => {
  const rootPath = useRouteMatch();
  const history = useHistory();
  const ClientCart = useContext(AppContext);

  const [isWebView, setIsWebView] = useState(Util.isWebView());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const [amount] = useState(
    props.location.state ? props.location.state.data.totalAmount : '1759.12'
  );
  const [orderId] = useState(
    props.location.state
      ? props.location.state.data.orderId
      : '609d06b2d7f6131cc5af3e4d'
  );
  const [accountId] = useState(
    props.location.state
      ? props.location.state.data.accountId
      : '6017af96c9923d3bec3e0e39'
  );
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState({});

  //modalTriggers
  const [cardsModal, setCardsModal] = useState(false);
  const [newCardModal, setNewCardModal] = useState(false);
  const [cvvModal, setcvvModal] = useState(false);

  //contactlessCard
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardcvv, setCardcvv] = useState('');
  const [cardName, setCardName] = useState('');

  //for cards
  const [savedCards, setSavedCards] = useState([]);
  const [savedCardsEdit, setSavedCardsEdit] = useState([]);
  const [selectedCard, setSelectedCard] = useState({});
  const [cvv, setcvv] = useState('');

  //newCard
  const [saveCardCheck, setSaveCardCheck] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardholderName, setNewCardholderName] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCardcvv, setNewCardcvv] = useState('');
  const [newCardName, setNewCardName] = useState('');

  const [headerParams] = useState({
    gobackEnabled: true,
    showScanner: false,
    showCart: false,
    staticHeaderText: false,
    gobackLinkRef: '',
    headerText: 'Shopping Details',
    headerTextLinkRef: '',
    storecode: '',
    rootPath: rootPath.url,
  });

  useEffect(() => {
    isWebView && sendDataToReactNative();
    getShoppingDetailsData();
    props.location.state && console.log(props.location.state.data);
  }, []);

  const handleChange = (card) => {
    setSelectedCard(card);
  };

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        'Shopping Details' + '-' + ClientCart.isEmpty()
      );
  }

  function getShoppingDetailsData() {
    api
      .get(config.api.getPaymentTypes, {
        store: 'BIAL004',
        coupon: 'xfff',
        amount: '600',
        eventname: 'generatecoupon',
        topic: 'couponstopic',
        orderid: '1234',
      })
      .then((data) => {
        if (data.data) {
          let paymentResponse = data.data;
          setPaymentOptions(paymentResponse.payOptions);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function insertGap(number) {
    var val = number;
    var newval = '';
    val = val.replace(/\s/g, '');
    for (var i = 0; i < val.length; i++) {
      if (i % 4 == 0 && i > 0) newval = newval.concat(' ');
      newval = newval.concat(val[i]);
    }
    return newval;
  }

  function removeGap(number) {
    return number.replace(/\s+/g, '').trim();
  }

  function getSavedCards(cardType) {
    setIsLoadingCards(true);
    const apiURL = config.api.mySavedCards;

    api
      .get(apiURL, {
        accountId,
        cardType,
      })
      .then((response) => {
        if (response.data) {
          let cardResponse = response.data;
          setSavedCards(cardResponse);

          let responseEdit = cardResponse;
          cardResponse.forEach((item) => {
            item.cardNoMasked = insertGap(item.cardNoMasked);
          });

          setSavedCardsEdit(responseEdit);
          setIsLoadingCards(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handlePaymentOptionClick(option, index) {
    setSelectedPaymentOption(option);
    if (option.payOptDesc === 'Debit Card') {
      isWebView && getSavedCards(option.cardsList[0].cardType);
      triggerCardModal();
    }
    if (option.payOptDesc === 'Credit Card') {
      isWebView && getSavedCards(option.cardsList[0].cardType);
      triggerCardModal();
    }
  }

  function triggerCardModal() {
    setCardsModal(!cardsModal);
    resetNewCardDetails();
  }

  function triggerNewCardModal() {
    setCardsModal(!cardsModal);
    setNewCardModal(!newCardModal);
  }

  function triggercvvModal() {
    setcvvModal(!cvvModal);
    setNewCardModal(!newCardModal);
  }

  function cardDetailsSanityCheck(
    cardNumber,
    cardholderName,
    cardExpiry,
    cardName
  ) {
    if (cardName) {
      //checks done on card number
      let cardNumberLocal = removeGap(cardNumber);
      let cardConfigAr = creditCardType(cardNumberLocal);
      let cardConfig = cardConfigAr[0];
      let cardLengthCheck = false;
      for (var i = 0; i < cardConfig.lengths.length; i++) {
        if (cardNumberLocal.length === cardConfig.lengths[i])
          cardLengthCheck = true;
      }
      if (!cardLengthCheck) {
        PushAlert.error('Cardnumber length is not valid');
        return false;
      }

      if (!validator.isNumeric(cardNumberLocal, { no_symbols: true })) {
        PushAlert.error('Cardnumber is not valid');
        return false;
      }

      //cardHolderName check
      if (!cardholderName) {
        PushAlert.error('Please enter a card holder name.');
        return false;
      }

      //date checks
      if (!(cardExpiry.length === 7)) {
        PushAlert.error('Expiry date is not valid');
        return false;
      }

      let month = cardExpiry.slice(0, 2);
      let year = cardExpiry.slice(3);
      if (month > 0 && month < 13) {
        if (year.length === 4) {
          console.log(year === moment().format('YYYY'));
          let numMonth = parseInt(month, 10);
          let numYear = parseInt(year, 10);
          let currentYear = parseInt(moment().format('YYYY'));
          let currentMonth = parseInt(moment().format('MM'));
          if (
            numYear < currentYear ||
            (numYear === currentYear &&
              (numMonth < currentMonth || numMonth === currentMonth))
          ) {
            PushAlert.error('Please enter a future date.');
            return false;
          }
        } else {
          PushAlert.error('Expiry year is not valid.');
          return false;
        }
      } else {
        PushAlert.error('Expiry month is not valid.');
        return false;
      }
    } else {
      PushAlert.error(
        'Issue with identifying card type, please re-enter number.'
      );
    }
    return true;
  }

  function cvvSanityCheck(cardNumber, cvv) {
    let cardNumberLocal = removeGap(cardNumber);
    let cardConfigAr = creditCardType(cardNumberLocal);
    let cardConfig = cardConfigAr[0];

    console.log(cardNumber, cvv);

    if (cvv && !(cvv.length === cardConfig.code.size)) {
      PushAlert.error('Invalid CVV');
      return false;
    }
    return true;
  }

  function handleProceedToCVV(
    cardNumber,
    cardholderName,
    cardExpiry,
    cardLabel,
    cardName
  ) {
    let cardNumberLocal = removeGap(cardNumber);
    let month = cardExpiry.slice(0, 2);
    let year = cardExpiry.slice(3);

    const sanityCheck = cardDetailsSanityCheck(
      cardNumber,
      cardholderName,
      cardExpiry,
      cardName
    );

    if (sanityCheck) {
      if (saveCardCheck)
        handleSaveCard(
          cardNumberLocal,
          cardholderName,
          month,
          year,
          cardLabel,
          cardName
        );
      else triggercvvModal();
    }
  }

  function handleCVVCheck(
    cardNumber,
    cardholderName,
    cardExpiry,
    cardLabel,
    cardName,
    cvv
  ) {
    let cardNumberLocal = removeGap(cardNumber);
    let month = cardExpiry.slice(0, 2);
    let year = cardExpiry.slice(3);

    const cvvCheck = cvvSanityCheck(cardNumber, cvv);

    console.log(cvvCheck);

    if (cvvCheck) handlePayCard(cardNumberLocal, month, year, cvv, cardName);
  }

  function handleSaveCard(
    cardNumber,
    cardholderName,
    expiryMonth,
    expiryYear,
    cardLabel,
    cardName
  ) {
    let cardType = selectedPaymentOption.cardsList[0].cardType;

    api
      .post(config.api.saveCard, {
        accountId,
        cardNo: cardNumber,
        expiryMonth,
        expiryYear,
        cardHolderName: cardholderName,
        remarks: cardLabel,
        cardType,
        cardName,
      })
      .then((data) => {
        if (data) {
          if (data.statusCode === 200) {
            resetNewCardDetails();
            getSavedCards(cardType);
            triggerNewCardModal();
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function resetNewCardDetails() {
    setNewCardNumber('');
    setNewCardholderName('');
    setNewCardExpiry('');
    setNewLabel('');
    setSaveCardCheck(false);
    setNewCardcvv('');
    setNewCardName('');
  }

  function handlePayCard(
    card_number,
    expiry_month,
    expiry_year,
    cvv_number,
    cardName
  ) {
    console.log({ cardName });
    //activeCheck
    let validCard = false;
    if (selectedPaymentOption.payOptDesc === 'Credit Card') {
      selectedPaymentOption.cardsList.forEach((item) => {
        let localCard = cardName;
        if (cardName === 'Mastercard') {
          localCard = 'MasterCard';
        }
        if (item.cardName === localCard && item.status === 'ACTI')
          validCard = true;
      });
    } else if (selectedPaymentOption.payOptDesc === 'Debit Card') {
      selectedPaymentOption.cardsList.forEach((item) => {
        let localCard = cardName;
        if (cardName === 'Mastercard') {
          localCard = 'MasterCard';
        }
        if (
          item.cardName === `${localCard} Debit Card` &&
          item.status === 'ACTI'
        )
          validCard = true;
      });
    }

    let token = '';
    if (isWebView)
      webTokenConfig.getToken().then((webToken) => {
        token = webToken;
        goToPaymentComponent(token);
      });
    else
      guestTokenConfig.getToken().then((guestToken) => {
        token = guestToken;
        goToPaymentComponent(token);
      });

    const goToPaymentComponent = (token) => {
      //the data_accept is 'Y' because we have already checked its status in the above logic
      validCard &&
        history.push({
          pathname: '/payment',
          state: {
            tokenParam: token,
            orderId,
            amount,
            payment_option: selectedPaymentOption.payOpt,
            card_type: selectedPaymentOption.cardsList[0].cardType,
            card_name: cardName,
            data_accept: 'Y',
            card_number: removeGap(card_number),
            expiry_month:
              typeof expiry_month === 'number'
                ? expiry_month.toString()
                : expiry_month,
            expiry_year:
              typeof expiry_year === 'number'
                ? expiry_year.toString()
                : expiry_year,
            cvv_number,
          },
        });
    };
  }

  function handlePayFromSavedCard(cvv_number) {
    console.log({ selectedCard });
    if (cvv_number) {
      handlePayCard(
        removeGap(selectedCard.cardNo),
        selectedCard.expiryMonth,
        selectedCard.expiryYear,
        cvv_number,
        selectedCard.cardCategory
      );
    }
  }

  return isLoading ? (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}></div>
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
      <div className='shoppingDetails-container'>
        {isWebView ? null : (
          <Header
            {...headerParams}
            amount={amount}
            currency={DummyData.data.currency}
          />
        )}

        <div
          className='shoppingDetails-container-body'
          style={{
            marginTop: isWebView ? '0' : '58pt',
          }}>
          {/* <div className='loyaltyPoints-wrapper'>
            <div className='loyaltyPoints-header'>
              <div className='loyaltyPoints-header-left'>
                <div className='loyaltyPoints-header-left-image'></div>
                <div className='loyaltyPoints-header-left-body'></div>
              </div>
              <div className='loyaltyPoints-header-right'></div>
            </div>
            <div className='loyaltyPoints-footer'>
              <div className='loyaltyPoints-footer-left'></div>
              <div className='loyaltyPoints-footer-right'></div>
            </div>
          </div> */}
          <div className='paymentOptions-wrapper'>
            <div className='paymentOptions-header'>Choose payment option</div>
            <div className='paymentOptions-body'>
              {paymentOptions.map((option, index) => (
                <PaymentOption
                  key={index}
                  option={option}
                  index={index}
                  handleClick={() => handlePaymentOptionClick(option)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*Modal One*/}
      <div
        className={
          cardsModal ? 'md-modal md-effect-3 md-show' : 'md-modal md-effect-3'
        }
        id='modal-1'>
        <div className='md-content md-content-container'>
          <div
            className='md-close-line-container'
            draggable={true}
            onClick={() => {
              triggerCardModal();
            }}
            onTouchEnd={() => triggerCardModal()}>
            <span className='md-close-line'></span>
          </div>
          <div className='md-header'>
            <div
              className='md-header-image'
              onClick={() => triggerCardModal()}></div>
            <div className='md-header-text'>
              {!isWebView
                ? 'Card Details'
                : selectedPaymentOption.payOptDesc
                ? selectedPaymentOption.payOptDesc
                : 'Debit or Credit Card'}
            </div>
          </div>
          {!isWebView ? (
            <div className='md-sub-header-text'>
              Please provide your card details
            </div>
          ) : null}
          {isWebView ? (
            !isLoadingCards && (
              <>
                {savedCardsEdit.map((card, index) => (
                  <SavedCard
                    key={index}
                    card={card}
                    selectedCard={selectedCard}
                    setSelectedCard={setSelectedCard}
                    cvv={cvv}
                    setcvv={setcvv}
                    handleChange={handleChange}
                  />
                ))}
                <div
                  className='add-card-container'
                  onClick={triggerNewCardModal}>
                  + Add Card
                </div>
                <div
                  className={
                    cvv.length > 2 ? 'payment-button' : 'payment-button-disable'
                  }
                  onClick={() => handlePayFromSavedCard(cvv)}>{`Pay Rs.${
                  amount ? amount : null
                }`}</div>
              </>
            )
          ) : (
            <div className='card-details-wrapper'>
              <CardDetailsTextInput
                value={cardNumber}
                setValue={setCardNumber}
                title={'Card Number'}
                pattern={'[0-9s]{13,16}'}
                autocomplete={'cc-number'}
                maxlength={'19'}
                placeholder={'xxxx xxxx xxxx xxxx'}
                type={'tel'}
                inputmode={'numeric'}
                insertGap={true}
                setCardName={setCardName}
              />
              <CardDetailsTextInput
                value={cardholderName}
                setValue={setCardholderName}
                title={'Cardholder Name'}
                placeholder={'Enter name'}
                type={'text'}
              />
              <div className='card-expiry-cvv-wrapper'>
                <CardDetailsTextInput
                  value={cardExpiry}
                  setValue={setCardExpiry}
                  title={'Expiry Date'}
                  placeholder={'MM/YYYY'}
                  type={'text'}
                  width={'40%'}
                  maxlength={'7'}
                  inputmode={'numeric'}
                  insertSlash={true}
                />
                <CardDetailsTextInput
                  value={cardcvv}
                  setValue={setCardcvv}
                  title={'CVV'}
                  placeholder={'xxx'}
                  type={'text'}
                  width={'40%'}
                  maxlength={'3'}
                  inputmode={'numeric'}
                />
              </div>
              <div
                className={'card-details-payment-button'}
                onClick={() =>
                  handlePayCard(
                    cardNumber,
                    cardExpiry.slice(0, 2),
                    cardExpiry.slice(3),
                    cardcvv,
                    cardName
                  )
                }>{`Proceed to payment`}</div>
            </div>
          )}
        </div>
      </div>

      {/*Modal Two*/}
      <div
        className={
          newCardModal ? 'md-modal md-effect-2 md-show' : 'md-modal md-effect-2'
        }
        id='modal-2'>
        <div className='md-content md-content-container'>
          <div
            className='md-close-line-container'
            draggable={true}
            onClick={() => {
              triggerNewCardModal();
            }}
            onTouchEnd={() => triggerNewCardModal()}>
            <span className='md-close-line'></span>
          </div>
          <div className='md-header'>
            <div
              className='md-header-image'
              onClick={() => triggerNewCardModal()}></div>
            <div className='md-header-text'>
              {!isWebView
                ? 'Card Details'
                : selectedPaymentOption.payOptDesc
                ? selectedPaymentOption.payOptDesc
                : 'Debit or Credit Card'}
            </div>
          </div>
          <div className='card-details-wrapper'>
            <CardDetailsTextInput
              value={newCardNumber}
              setValue={setNewCardNumber}
              title={'Card Number'}
              pattern={'[0-9s]{13,16}'}
              autocomplete={'cc-number'}
              maxlength={'19'}
              placeholder={'xxxx xxxx xxxx xxxx'}
              type={'tel'}
              inputmode={'numeric'}
              insertGap={true}
              setNewCardName={setNewCardName}
            />
            <CardDetailsTextInput
              value={newCardholderName}
              setValue={setNewCardholderName}
              title={'Cardholder Name'}
              placeholder={'Enter cardholder name'}
              type={'text'}
            />
            <CardDetailsTextInput
              value={newCardExpiry}
              setValue={setNewCardExpiry}
              title={'Expiry Date'}
              placeholder={'MM/YYYY'}
              type={'text'}
              maxlength={'7'}
              insertSlash={true}
            />
            <CardDetailsTextInput
              value={newLabel}
              setValue={setNewLabel}
              title={'Add Label'}
              placeholder={'Enter label'}
              type={'text'}
            />
            <div className='save-card-wrapper'>
              <GreenCheckbox
                checked={saveCardCheck}
                onChange={() => setSaveCardCheck(!saveCardCheck)}
              />
              <div>Save Card</div>
            </div>
            <div
              className={'card-details-payment-button'}
              onClick={() =>
                handleProceedToCVV(
                  newCardNumber,
                  newCardholderName,
                  newCardExpiry,
                  newLabel,
                  newCardName
                )
              }>
              {saveCardCheck ? `Add Card` : `Proceed`}
            </div>
          </div>
        </div>
      </div>

      {/*Modal Three CVV*/}
      <div
        className={
          cvvModal ? 'md-modal md-effect-2 md-show' : 'md-modal md-effect-2'
        }
        id='modal-2'>
        <div className='md-content md-content-container'>
          <div
            className='md-close-line-container'
            draggable={true}
            onClick={() => {
              triggercvvModal();
            }}
            onTouchEnd={() => triggercvvModal()}>
            <span className='md-close-line'></span>
          </div>
          <div className='md-header'>
            <div
              className='md-header-image'
              onClick={() => triggercvvModal()}></div>
            <div className='md-header-text'>Enter CVV</div>
          </div>
          <div className='card-details-wrapper'>
            <CardDetailsTextInput
              value={newCardcvv}
              setValue={setNewCardcvv}
              title={'CVV'}
              placeholder={'xxx'}
              type={'text'}
              width={'20%'}
              maxlength={'4'}
              inputmode={'numeric'}
            />
            <div
              className={'card-details-payment-button'}
              onClick={() =>
                handleCVVCheck(
                  newCardNumber,
                  newCardholderName,
                  newCardExpiry,
                  newLabel,
                  newCardName,
                  newCardcvv
                )
              }>{`Pay ₹${amount}`}</div>
          </div>
        </div>
      </div>
      <div className='md-overlay'></div>
    </div>
  );
};

const PaymentOption = (props) => {
  return (
    <div
      className={'paymentOption'}
      onClick={() => props.handleClick(props.option.payOptDesc, props.index)}>
      <div className='paymentOption-left'>
        <div className='paymentOption-left-image'></div>
        <div className='paymentOption-left-text'>{props.option.payOptDesc}</div>
      </div>
      <div className='paymentOption-right'></div>
      {/* {props.option.active ? null : (
        <div className='paymentOption-disabled'>
          <div className='paymentOption-left' style={{ border: '0pt' }}>
            <div className='paymentOption-left-image'></div>
            <div className='paymentOption-left-text' style={{ color: '#fff' }}>
              {`${props.option.payOptDesc} (Currently Unavailable)`}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

const SavedCard = (props) => {
  return (
    <div className='card-wrapper'>
      <GreenRadio
        checked={props.selectedCard.cardNo === props.card.cardNo}
        onChange={() => props.handleChange(props.card)}
        value='a'
        name='radio-button'
        inputProps={{ 'aria-label': 'A' }}
      />
      {props.selectedCard.cardNo === props.card.cardNo ? (
        <div className='cardNo-selected-wrapper'>
          <div className='cardNo-selected-container'>
            {props.card.cardNoMasked.slice(4)}
          </div>
          <input
            className='cvv-container'
            placeholder='CVV'
            type='text'
            onChange={(e) => props.setcvv(e.target.value)}
            maxLength={'3'}
            inputmode='numeric'
            autoFocus
          />
        </div>
      ) : (
        <div
          className='cardNo-container'
          onClick={() => props.handleChange(props.card)}>
          {props.card.cardNoMasked}
        </div>
      )}
    </div>
  );
};

const CardDetailsTextInput = (props) => {
  function insertGap(number) {
    var val = number;
    var newval = '';
    val = val.replace(/\s/g, '');
    for (var i = 0; i < val.length; i++) {
      if (i % 4 == 0 && i > 0) newval = newval.concat(' ');
      newval = newval.concat(val[i]);
    }
    let cardConfigAr = creditCardType(newval);

    props.setNewCardName &&
      props.setNewCardName(cardConfigAr.length && cardConfigAr[0].niceType);

    props.setCardName &&
      props.setCardName(cardConfigAr.length && cardConfigAr[0].niceType);
    props.setValue(newval);
  }

  function insertSlash(date) {
    if (
      date.length === 2 &&
      moment(date).isValid() &&
      validator.isNumeric(date)
    ) {
      props.setValue(date + '/');
    } else props.setValue(date);
  }

  function handleChange(e) {
    if (props.insertGap) insertGap(e.target.value);
    else if (props.insertSlash) insertSlash(e.target.value);
    else props.setValue(e.target.value);
  }

  return (
    <div
      className='card-details-input-wrapper'
      style={{ width: props.width ? props.width : '' }}>
      <div className='input-header'>{props.title}</div>
      <input
        className='input-text'
        type={props.text ? props.text : ''}
        inputMode={props.number ? props.number : ''}
        pattern={props.pattern ? props.pattern : ''}
        autoComplete={props.autocomplete ? props.autocomplete : ''}
        maxLength={props.maxlength ? props.maxlength : ''}
        placeholder={props.placeholder ? props.placeholder : ''}
        value={props.value}
        onChange={(e) => handleChange(e)}
      />
    </div>
  );
};

export default ShoppingDetails;
