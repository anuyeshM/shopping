import axios from 'axios';
import moment from 'moment';
import config from '../config';
import env from '../env';

const instance = axios.create({
  baseURL: env.gatewayURL,
  headers: {
    'content-type': 'application/json',
  },
});

const guestTokenConfig = {
  setToken: (accountId, accessToken, refreshToken, expiresAt) => {
    if (accountId && accessToken && refreshToken && expiresAt) {
      let guestUser = { accountId, accessToken, refreshToken, expiresAt };
      window.localStorage.setItem('guestUser', JSON.stringify(guestUser));
      return true;
    } else {
      return false;
    }
  },
  getToken: async () => {
    let guestUser = JSON.parse(window.localStorage.getItem('guestUser'));

    if (guestUser && moment(guestUser.expiresAt).isAfter(new Date())) {
      return guestUser.accessToken;
    }
    const response = await instance({
      method: 'GET',
      url: config.api.guestLogin,
      data: {},
    });

    const { data } = response;

    if (data.status === 200 && data.type === 'success') {
      const guestData = data.data;
      let guestUser = {
        accountId: guestData.userId,
        accessToken: guestData.accessToken,
        refreshToken: guestData.refreshToken,
        expiresAt: guestData.expiresAt,
      };
      window.localStorage.setItem('guestUser', JSON.stringify(guestUser));
      console.log({ guestUser });
      return guestUser.accessToken;
    } else {
      return false;
    }
  },
  createToken: async () => {
    const response = await instance({
      method: 'GET',
      url: config.api.guestLogin,
      data: {},
    });

    const { data } = response;

    if (data.status === 200 && data.type === 'success') {
      let guestData = data.data;
      let guestUser = {
        accountId: guestData.userId,
        accessToken: guestData.accessToken,
        refreshToken: guestData.refreshToken,
        expiresAt: guestData.expiresAt,
      };
      window.localStorage.setItem('guestUser', JSON.stringify(guestUser));
      return guestUser.accessToken;
    } else {
      return false;
    }
  },
  isValid: () => {
    let guestUser = JSON.parse(window.localStorage.getItem('guestUser'));
    if (guestUser && moment(guestUser.expiresAt).isAfter(new Date()))
      return true;
    else return false;
  },
};

export default guestTokenConfig;
