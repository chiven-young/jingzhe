import axios from 'axios';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import Cookies from 'js-cookie';

const isTauri = window.__TAURI__ ? true : false;
const getToken = () => {
  if (isTauri) {
    return localStorage.getItem('serviceToken');
  } else {
    const platformUserData = localStorage.getItem('platform-user') && JSON.parse(localStorage.getItem('platform-user'));
    const token = platformUserData?.accessToken;
    return token;
  }
}

const clientOptions = {
  connectTimeout: 60000, // 连接超时时间（毫秒）
  maxRedirections: 5,   // 最大重定向次数
};

const getHeaders = () => {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (response.ok || response.status === 200) {
    return await response.json();
  } else {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
};

const requests = {
  get: async (url) => {
    if (isTauri) {
      // Tauri's GET request using @tauri-apps/plugin-http
      const response = await tauriFetch(url, {
        method: 'GET',
        headers: getHeaders(),
        ...clientOptions,
      });
      return handleResponse(response);
    } else {
      // Axios GET request for web
      const response = await axios.get(url, {
        headers: getHeaders(),
      });
      return response.data;
    }
  },

  post: async (url, data) => {
    if (isTauri) {
      // Tauri's POST request using @tauri-apps/plugin-http
      const response = await tauriFetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
        ...clientOptions,
      });
      return handleResponse(response);
    } else {
      // Axios POST request for web
      const response = await axios.post(url, data, {
        headers: getHeaders(),
      });
      return response.data;
    }
  },

  // Additional methods can be added similarly
};

export default requests;
