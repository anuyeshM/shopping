import axios from 'axios';
import env from './env';
import Util from './util/util';
import webTokenConfig from './util/webTokenConfig';
import guestTokenConfig from './util/guestTokenConfig';

const instance = axios.create({
  baseURL: env.gatewayURL,
  headers: {
    'content-type': 'application/json',
  },
});

const api = {
  get: async (url, data) => {
    const isWebView = Util.isWebView();
    let token = '';
    if (isWebView) {
      token = await webTokenConfig.getToken();
    } else {
      token = await guestTokenConfig.getToken();
    }

    const response = await instance({
      method: 'GET',
      url: `${url}`,
      params: data,
      headers: {
        Authorization: token ? token : null,
      },
    });
    return response.data;
  },
  post: async (url, data, headers) => {
    const isWebView = Util.isWebView();
    let token = '';

    if (isWebView) {
      token = await webTokenConfig.getToken();
    } else {
      token = await guestTokenConfig.getToken();
    }

    const response = await instance({
      method: 'POST',
      url: `${url}`,
      data,
      headers: {
        Authorization: token ? token : null,
        ...headers,
      },
    });

    return response.data;
  },
  patch: async (url, data, headers, override) => {
    const isWebView = Util.isWebView();

    let token = '';
    if (override) token = null;
    else {
      if (isWebView) {
        token = await webTokenConfig.getToken();
      } else {
        token = await guestTokenConfig.getToken();
      }
    }

    const response = await instance({
      method: 'PATCH',
      url: `${url}`,
      data,
      headers: {
        Authorization: token,
        ...headers,
      },
    });
    return response.data;
  },
  put: async (url, data, headers) => {
    const isWebView = Util.isWebView();
    let token = '';
    if (isWebView) {
      token = await webTokenConfig.getToken();
    } else {
      token = await guestTokenConfig.getToken();
    }
    const response = await instance({
      method: 'PUT',
      url: `${url}`,
      data,
      headers: {
        Authorization: token,
        ...headers,
      },
    });
    return response.data;
  },
  delete: async (url, data, headers) => {
    const isWebView = Util.isWebView();
    let token = '';
    if (isWebView) {
      token = await webTokenConfig.getToken();
    } else {
      token = await guestTokenConfig.getToken();
    }
    const response = await instance({
      method: 'DELETE',
      url: `${url}`,
      data,
      headers: {
        Authorization: token,
        ...headers,
      },
    });
    return response.data;
  },
};

export default api;
