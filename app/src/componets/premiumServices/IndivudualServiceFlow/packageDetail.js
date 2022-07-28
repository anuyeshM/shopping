import React, { useState, useEffect, useContext } from 'react';
import { useRouteMatch, useHistory, useParams } from 'react-router-dom';

//misc
import Loader from '../../loader/loader';
import PushAlert from '../../../commons/notification';
import config from '../../../commons/config';
import Header from '../../header/headerComponent';
import Datetime from 'react-datetime';
import Modal from 'react-bootstrap/Modal';
import OptionCard from '../subcomponent/detailsOptionCard';
import 'react-datetime/css/react-datetime.css';
import './serviceDetail.css';
import QuantityCounter from './subcomponent/quantityCounter';
import Checkbox from '../subcomponent/checkbox';
import AppContext from '../../../commons/context';
import { Context as MyFlightsContext } from '../../../context/FlightsContext';
import Util from '../../../commons/util/util';
import $ from 'jquery';

const PackageDetail = (props) => {
  const history = useHistory();
  const rootPath = useRouteMatch();
  const params = useParams();
  let pid = params.packageId || props.location.state.id;
  const ClientCart = useContext(AppContext);
  const { state: flightState } = useContext(MyFlightsContext);
  const [isWebView] = useState(Util.isWebView());
  const [isLoading, setIsLoading] = useState(true);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [modalIsLoading, setModalIsLoading] = useState(true);
  const [serviceInfo, setServiceInfo] = useState({});
  const [isAdded, setIsAdded] = useState(false);
  const [baggageInsurance, setBaggageInsurance] = useState(false);
  const [headerParams] = useState({
    gobackEnabled: true,
    showScanner: true,
    showCart: true,
    staticHeaderText: true,
    gobackLinkRef: '',
    headerText: props.location.state.title,
    headerTextLinkRef: '',
    storecode: '',
    rootPath: rootPath.url,
  });
  const [flightData, setFlightData] = useState(flightState.flightData);
  // const defaultSelectedFlight = (flightData[0]) ? flightData[0].flightId : '';
  const defaultSelectedFlight = props.location.state
    ? props.location.state.selectedFlightId
    : flightData[0]
    ? flightData[0].flightId
    : '';
  const [selected, setSelected] = useState(defaultSelectedFlight);
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [counterValue, setCounterValue] = useState(1);
  const [details, setDetails] = useState([]);
  const [qtyDrivenFields, setQtyDrivenFields] = useState();
  const [selectedOption, setSelectedOption] = useState({
    id: '',
    price: '',
    title: '',
    discountPercent: '',
  });
  const [flightPickerDetails, setFlightPickerDetails] = useState({
    flightId: '',
    baseAirport: '',
    terminal: '',
    srcDestAirport: '',
    scheduleDate: '',
    scheduleTime: '',
    movementType: '',
    sector: '',
  });

  const refItemQuantity =
    props.location.state && props.location.state.itemQty
      ? +props.location.state.itemQty
      : 1;

  useEffect(() => {
    getDetails();
    sendDataToReactNative();
  }, []);

  function sendDataToReactNative() {
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        props.location.state.title + '-' + ClientCart.isEmpty()
      );
  }

  const getDetails = async () => {
    console.log(pid);
    let regResponse = [];
    if (pid === 'pacZ5PJPEpQvJAtGFv9o') {
      regResponse = [
        {
          title: 'Platinum Package',
          price: 5000,
          qtyDrivenFields: ['No of Pax'],
          _id: 'Bw23kDQZFiZqtWiTE',
          features: [
            {
              featureName: 'Valet Service',
            },
            {
              featureName: 'Meet & Greet',
            },
            {
              featureName: 'Porter',
            },
            {
              featureName: 'Fast track',
            },
            {
              featureName: 'Lounge',
            },
          ],
          discount_perc: '0',
          cardOffers: [],
          templateID: '2',
        },
      ];
    } else if (pid === 'pacZ5PJPEpQvJAtGFv91') {
      regResponse = [
        {
          title: 'Gold Package',
          price: 3000,
          qtyDrivenFields: ['No of Pax'],
          _id: 'Bw23kDQZaFiZqtWiTE',
          features: [
            {
              featureName: 'Car parking',
            },
            {
              featureName: 'Meet & Greet',
            },
            {
              featureName: 'Porter',
            },
            {
              featureName: 'Fast track',
            },
            {
              featureName: 'Lounge',
            },
          ],
          discount_perc: '0',
          cardOffers: [],
          templateID: '2',
        },
      ];
    } else if (pid === 'pacZ5PJPEpQvJAtGFv8o') {
      regResponse = [
        {
          title: 'Silver Package',
          price: 2000,
          qtyDrivenFields: ['No of Pax'],
          _id: 'Bw23kDQZFiZqtWiTE',
          features: [
            {
              featureName: 'Meet & Greet',
            },
            {
              featureName: 'Porter',
            },
            {
              featureName: 'Fast track',
            },
          ],
          discount_perc: '0',
          cardOffers: [],
          templateID: '2',
        },
      ];
    }
    console.log(regResponse);
    // let regResponse = await apiResponse.json();
    regResponse.forEach(function (element, index) {
      element.selectedFlag = false;
      if (index === 0) {
        setQtyDrivenFields(element.qtyDrivenFields);
      }
    });
    setDetails(regResponse);
    setIsLoading(false);
  };

  function handlePicker(e) {
    setSelected(e.target.value);
    flightData.forEach((element) => {
      if (element.flightId === e.target.value) {
        setFlightPickerDetails({
          ...flightPickerDetails,
          flightId: element.flightId,
          baseAirport: element.baseAirport,
          terminal: element.terminal,
          srcDestAirport: element.srcDestAirport,
          scheduleDate: element.scheduleDate,
          scheduleTime: element.scheduleTime,
          sector: element.sector,
          movementType: element.movementType,
        });
      }
    });
  }

  function getFlightInformation() {
    if (flightPickerDetails.flightId) {
      return (
        <p className='flight-select-info'>
          {flightPickerDetails.baseAirport} -{' '}
          {flightPickerDetails.srcDestAirport} {flightPickerDetails.terminal}
          {'\n'}
          {flightPickerDetails.scheduleDate}{' '}
          {flightPickerDetails.scheduleTime.slice(0, 5)}
        </p>
      );
    }
    if (flightState.flightData.length === 1) {
      return flightState.flightData.map((item, index) => {
        if (index === 0) {
          return (
            <p key={index} className='flight-select-info'>
              {/* BLR to LHR T1{"\n"}24/03/2020 13:55 */}
              {item.baseAirport} - {item.srcDestAirport} {item.terminal}{' '}
              {item.scheduleDate} {item.scheduleTime.slice(0, 5)}
            </p>
          );
        }
      });
    }
    if (flightState.flightData.length > 0 && flightPickerDetails.flightId) {
      return (
        <p className='flight-select-info'>
          {flightPickerDetails.baseAirport} -{' '}
          {flightPickerDetails.srcDestAirport} {flightPickerDetails.terminal}{' '}
          {flightPickerDetails.scheduleDate}{' '}
          {flightPickerDetails.scheduleTime.slice(0, 5)}
        </p>
      );
    }
    if (flightState.flightData.length > 0) {
      return flightState.flightData.map((item, index) => {
        if (index === 0) {
          return (
            <p key={index} className='flight-select-info'>
              {item.baseAirport} - {item.srcDestAirport} {item.terminal}{' '}
              {item.scheduleDate} {item.scheduleTime.slice(0, 5)}
            </p>
          );
        }
      });
    }
    return <p />;
  }

  function handleIncrement() {
    setCounterValue(counterValue + 1);
  }

  function handleDecrement() {
    if (counterValue > 1) {
      setCounterValue(counterValue - 1);
    }
  }
  const addCartEvent = (event) => {
    let currQty = 1;
    if (counterValue['No of Pax'] !== undefined) {
      currQty = counterValue['No of Pax'];
    } else if (counterValue['No of Bags'] !== undefined) {
      currQty = counterValue['No of Bags'];
    } else {
      currQty = 1;
    }
    console.log(currQty);
    const $root = $(document);
    const itemId = selectedOption.id;
    const itemPrice = selectedOption.price * currQty;
    const itemLabel = props.location.state.title;
    const itemQuantity = currQty;
    const maxQuantity = 5;
    const itemType = 'service';

    if (isAdded) {
      const removeParam = {
        storecode: pid,
        storename: props.location.state.title,
        productId: itemId,
      };
      ClientCart.removeItem(removeParam);
      PushAlert.success('Item removed from cart');
      setIsAdded(!isAdded);
    } else {
      const addParam = {
        storecode: pid,
        storename: props.location.state.title,
        item: {
          itemId,
          itemLabel,
          itemPrice,
          itemQuantity,
          maxQuantity,
          itemType,
        },
      };

      if (ClientCart.addItem(addParam)) {
        PushAlert.success('Item successfully added to cart');
        setIsAdded(!isAdded);
      }
    }
    console.log(ClientCart.getItems());

    if (ClientCart.isEmpty()) {
      $root.find('[data-id="headerCart"]').addClass('header-cart-empty');
      $root.find('[data-id="headerCart"]').removeClass('header-cart-filled');
    } else {
      $root.find('[data-id="headerCart"]').addClass('header-cart-filled');
      $root.find('[data-id="headerCart"]').removeClass('header-cart-empty');
    }
    history.push({
      pathname: `/premiumServices`,
    });
  };

  return (
    // <div>Exclusive Package</div>
    <div className='details-container'>
      {modalIsVisible ? null : isWebView ? null : <Header {...headerParams} />}
      {isLoading ? (
        <div className='loader-container'>
          <Loader />
        </div>
      ) : (
        <div className='wrapper'>
          <div
            className={
              isWebView ? 'content-webview-container' : 'content-container'
            }>
            <div className='flight-select-container'>
              <p className='flight-select-text'>Flight</p>
              <div className='picker-container'>
                <select
                  value={selected}
                  className='picker'
                  onChange={(e) => handlePicker(e)}>
                  {flightData &&
                    flightData.map((option, index) => (
                      <option value={option.flightId} key={`opt_${index}`}>
                        {option.flightId}
                      </option>
                    ))}
                </select>
              </div>
              {getFlightInformation()}
            </div>
            <div className='detail-option-container'>
              <p className='option-label'>Choose Option</p>
              <div className='option-card-container'>
                <div
                  className='horizontal-scroll-classification'
                  style={{
                    gridTemplateColumns: 'auto auto auto auto',
                    // gridTemplateColumns: `repeat(${Math.max(
                    //     3,
                    //     details.length
                    // )}, 13rem)`,
                  }}>
                  {details &&
                    details.map((item, index) => (
                      <OptionCard
                        key={item._id}
                        modalIsVisible={modalIsVisible}
                        setModalIsVisible={setModalIsVisible}
                        setModalIsLoading={setModalIsLoading}
                        setServiceInfo={setServiceInfo}
                        item={item}
                        details={details}
                        setDetails={setDetails}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                      />
                    ))}
                </div>
              </div>
            </div>

            <div className='user-input-container'>
              <div className='time-picker-container'>
                <p className='time-picker-label'>Expected Arrival to Airport</p>
                <div className='time-picker'>
                  <Datetime
                    value={arrivalTime}
                    disableOnClickOutside={true}
                    onChange={(value) => setArrivalTime(value)}
                    timeFormat='HH:mm'
                    dateFormat={false}
                  />
                </div>
              </div>
              {qtyDrivenFields.map((item, index) => (
                <QuantityCounter
                  key={index}
                  value={item}
                  index={index}
                  counterValue={counterValue}
                  setCounterValue={setCounterValue}
                />
              ))}
              {pid === 'Z5PJPEpQvqqqJAtGFv91' ? (
                <div className='luggage-checkbox-container'>
                  <label>
                    <Checkbox
                      checked={baggageInsurance}
                      onChange={() => setBaggageInsurance(!baggageInsurance)}
                    />
                    <span style={{ marginLeft: '10px', fontSize: '12pt' }}>
                      Include Baggage Insurance
                    </span>
                  </label>
                </div>
              ) : null}
            </div>
          </div>
          <div className='submit-button-container'>
            <button
              className='submit-button'
              onClick={addCartEvent}
              disabled={selectedOption.id === ''}>
              {isAdded
                ? 'Remove Item'
                : `Add to Cart ${
                    selectedOption.price
                      ? '- ₹ ' +
                        (
                          `${selectedOption.price}` *
                          `${
                            counterValue['No of Pax']
                              ? counterValue['No of Pax']
                              : counterValue['No of Bags']
                              ? counterValue['No of Bags']
                              : counterValue
                          }`
                        ).toLocaleString()
                      : ''
                  }`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetail;
