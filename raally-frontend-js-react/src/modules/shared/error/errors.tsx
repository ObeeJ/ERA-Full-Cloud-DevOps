import Message from 'src/view/shared/message';
import { getHistory } from 'src/modules/store';
import { i18n, i18nExists } from 'src/i18n';
import authService from 'src/modules/auth/authService';

const DEFAULT_ERROR_MESSAGE = i18n(
  'errors.defaultErrorMessage',
);

function selectErrorKeyOrMessage(error) {
  if (error && error.response && error.response.data) {
    // Handle structured error responses
    if (error.response.data.error && error.response.data.error.message) {
      return error.response.data.error.message;
    }
    
    // Handle direct string responses
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    
    // Handle any other structured data
    if (error.response.data.message) {
      return error.response.data.message;
    }
    
    // If response data exists but no recognizable message structure
    return JSON.stringify(error.response.data);
  }

  // Handle regular error objects
  if (error && error.message) {
    return error.message;
  }

  // Final fallback
  return DEFAULT_ERROR_MESSAGE;
}

function selectErrorMessage(error) {
  const key = selectErrorKeyOrMessage(error);

  if (i18nExists(key)) {
    return i18n(key);
  }

  return key;
}

function selectErrorCode(error) {
  if (error && error.response && error.response.status) {
    return error.response.status;
  }

  return 500;
}

export default class Errors {
  static handle(error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(selectErrorMessage(error));
      console.error(error);
    }

    if (selectErrorCode(error) === 401) {
      authService.signout();
      window.location.reload();
      return;
    }

    if (selectErrorCode(error) === 403) {
      getHistory().push('/403');
      return;
    }

    if ([400, 429].includes(selectErrorCode(error))) {
      Message.error(selectErrorMessage(error));
      return;
    }

    getHistory().push('/500');
  }

  static errorCode(error) {
    return selectErrorCode(error);
  }

  static selectMessage(error) {
    return selectErrorMessage(error);
  }

  static showMessage(error) {
    Message.error(selectErrorMessage(error));
  }
}
