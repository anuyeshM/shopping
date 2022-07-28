import api from '../commons/api';
import config from '../commons/config';
import CreateDataContext from './CreateDataContext';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'addAuthData':
      return {
        ...state,
        accountID: action.payload.accountId,
        fullName: action.payload.fullName,
        contact: action.payload.mobile,
        email: action.payload.email,
      };
    default:
      return state;
  }
};

const setAuthData = (dispatch) => async (accountId) => {
  try {
    let reqPath = config.api.getUserDetails_v2.replace('{{id}}', accountId);
    const apiResponse = await api.get(reqPath, {});

    let regResponse = apiResponse;
    if ('success' === regResponse.type && 200 === regResponse.status) {
      dispatch({
        type: 'addAuthData',
        payload: {
          accountId,
          fullName: regResponse.data.fullName,
          mobile: regResponse.data.mobile,
          email: regResponse.data.email || '',
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

const hardSetAuthData =
  (dispatch) => async (accountId, fullName, mobile, email) => {
    dispatch({
      type: 'addAuthData',
      payload: {
        accountId,
        fullName,
        mobile,
        email,
      },
    });
  };

export const { Context, Provider } = CreateDataContext(
  authReducer,
  {
    setAuthData,
    hardSetAuthData,
  },
  {
    accountID: '',
    fullName: '',
    contact: '',
    email: '',
  }
);
