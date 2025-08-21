import { AuthToken } from 'src/modules/auth/authToken';
import Axios from 'axios';
import config from 'src/config';
import { getLanguageCode } from 'src/i18n';
import Qs from 'qs';
import moment from 'moment';

const authAxios = Axios.create({
  baseURL: config.backendUrl,
  paramsSerializer: function (params) {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      filter: (prefix, value) => {
        if (
          moment.isMoment(value) ||
          value instanceof Date
        ) {
          return value.toISOString();
        }

        return value;
      },
    });
  },
});

authAxios.interceptors.request.use(
  async function (options) {
    const token = AuthToken.get();

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    options.headers['Accept-Language'] = getLanguageCode();

    return options;
  },
  function (error) {
    console.log('Request error: ', error);
    return Promise.reject(error);
  },
);

// Add response interceptor to handle errors consistently
authAxios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Ensure error has a consistent structure
    if (!error.response) {
      // Network error or request timeout
      error.response = {
        status: 0,
        data: {
          error: {
            message: 'Network error. Please check your connection.',
            code: 0
          }
        }
      };
    } else if (!error.response.data) {
      // Response without data
      error.response.data = {
        error: {
          message: `Server error (${error.response.status})`,
          code: error.response.status
        }
      };
    } else if (typeof error.response.data === 'string') {
      // String response - wrap in proper structure
      const message = error.response.data;
      error.response.data = {
        error: {
          message: message,
          code: error.response.status
        }
      };
    } else if (!error.response.data.error) {
      // Data exists but no error structure
      error.response.data = {
        error: {
          message: error.response.data.message || 'An error occurred',
          code: error.response.status
        }
      };
    }
    
    return Promise.reject(error);
  }
);

export default authAxios;
