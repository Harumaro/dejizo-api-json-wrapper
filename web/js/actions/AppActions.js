import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';

export function translate (query) {
  AppDispatcher.dispatch({
    actionType: AppConstants.TRANSLATE,
    query: query
  });
}

export function getTranslation (match) {
  AppDispatcher.dispatch({
    actionType: AppConstants.TRANSLATED,
    match: match
  });
}