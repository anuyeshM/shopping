import api from '../commons/api';
import config from '../commons/config';
import CreateDataContext from './CreateDataContext';

const promoReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'setAplicablePromo':
      return {
        ...state,
        applicablePromo: action.payload.data,
      };
    default:
      return state;
  }
};

const setAplicablePromotions = (dispatch) => async (accountId, accessToken) => {
  try {
    const apiURL = config.api.getApplicablePromo;
    let apiResponse = await api.post(apiURL, {
      customerId: accountId,
    });

    let responseObj = apiResponse;
    if ('success' === responseObj.type && 200 === responseObj.status) {
      dispatch({
        type: 'setAplicablePromo',
        payload: {
          data: responseObj.data,
        },
      });
    }
  } catch (e) {
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong with adding auth data',
    });
  }
};

export const { Context, Provider } = CreateDataContext(
  promoReducer,
  {
    setAplicablePromotions,
  },
  {
    applicablePromo: [],
  }
);
