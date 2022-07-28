import CreateDataContext from './CreateDataContext';

//apicall
import config from '../commons/config';
import api from '../commons/api';

const flightDataReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'addFlightData':
      return {
        ...state,
        flightData: action.payload.flightData,
      };
    default:
      return state;
  }
};

const myFlights = (dispatch) => async (accountId) => {
  // console.log('From My Flight Context', accountId);
  const apiURL = config.api.myFlights;
  api
    .post(apiURL, {
      accountId,
    })
    .then((response) => {
      if (response.data) {
        const flightResponse = response.data;
        let flights = JSON.parse(JSON.stringify(flightResponse.flights));
        flights.forEach((item) => {
          if (item.movementType === 'A') {
            let tempCode = item.baseAirport;
            let tempName = item.baseAirportName;
            item.baseAirport = item.srcDestAirport;
            item.baseAirportName = item.srcDestAirportName;
            item.srcDestAirport = tempCode;
            item.srcDestAirportName = tempName;
          }
        });
        dispatch({
          type: 'addFlightData',
          payload: {
            flightData: flights,
          },
        });
      }
    })
    .catch((e) => {
      dispatch({
        type: 'add_error',
        payload: 'Something went wrong with adding flight data',
      });
    });
};

const removeFlight = (dispatch) => async (accountId, flightUid) => {
  const apiURL = config.api.removeFlight;
  api
    .post(apiURL, {
      accountId,
      // accountId: '60bdeb3ff8ad187194b8ce92',
      flightUid,
    })
    .then((response) => {
      if (response.data) {
        // const response = response.data.data.data;
        console.log('removeFlight', response.data);
      }
    })
    .catch((error) => {
      dispatch({
        type: 'add_error',
        payload: 'Something went wrong with adding flight data',
      });
    });
};

export const { Context, Provider } = CreateDataContext(
  flightDataReducer,
  { myFlights, removeFlight },
  { flightData: [] }
);
