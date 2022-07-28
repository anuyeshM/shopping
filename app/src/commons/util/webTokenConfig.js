import axios from 'axios';
import moment from 'moment';
import config from '../config';
import env from '../env';
import PushAlert from '../notification';

const instance = axios.create({
  baseURL: env.gatewayURL,
  headers: {
    'content-type': 'application/json',
  },
});

const webTokenConfig = {
  setToken: (accountId, accessToken, refreshToken, expiresAt) => {
    if (accessToken && refreshToken && expiresAt) {
      let webUser = { accountId, accessToken, refreshToken, expiresAt };
      window.localStorage.setItem('webUser', JSON.stringify(webUser));
      return true;
    } else {
      return false;
    }
  },
  resetToken: () => {
    window.localStorage.removeItem('webUser');
  },
  getToken: async () => {
    let webUser = JSON.parse(window.localStorage.getItem('webUser'));

    if (webUser && moment(webUser.expiresAt).isAfter(new Date())) {
      return webUser.accessToken;
    } else {
      const response = await instance({
        method: 'PUT',
        url: config.api.refresh,
        data: {},
        headers: {
          RefreshToken: webUser.refreshToken,
        },
      });

      const { data } = response;

      if (data.type === 'success' && data.status === 200) {
        webUser = {
          accountId: data.data.userId,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresAt: data.data.expiresAt,
        };
        window.localStorage.setItem('webUser', JSON.stringify(webUser));
        return webUser.accessToken;
      }
      PushAlert.info('Your user access token has expired, please login again');
      return false;
    }
  },
  getUser: async () => {
    let webUser = JSON.parse(window.localStorage.getItem('webUser'));

    if (webUser && moment(webUser.expiresAt).isAfter(new Date())) {
      return webUser;
    } else {
      const response = await instance({
        method: 'PUT',
        url: config.api.refresh,
        data: {},
        headers: {
          RefreshToken: webUser.refreshToken,
        },
      });

      const { data } = response;

      if (data.type === 'success' && data.status === 200) {
        webUser = {
          accountId: data.data.userId,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresAt: data.data.expiresAt,
        };
        window.localStorage.setItem('webUser', JSON.stringify(webUser));
        return webUser;
      }
      PushAlert.info('Your user access token has expired, please login again');
      return false;
    }
  },
};

export default webTokenConfig;
