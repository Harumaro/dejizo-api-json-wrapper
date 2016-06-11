import React from 'react';
import WordLookup from '../components/WordLookup.react';
import TranslationResults from '../components/TranslationResults.react';
import * as AppActions from '../actions/AppActions';
import AppConstants from '../constants/AppConstants';
import AppDispatcher from '../dispatcher/AppDispatcher';
import request from 'request-promise';

export default React.createClass({
  getInitialState: function () {
    return {
      translation: {},
      isTranslating: false
    };
  },

  componentDidMount: function () {
    var _this = this;
    AppDispatcher.register(function (action) {
      switch (action.actionType) {
        case AppConstants.TRANSLATE:
          _this.setState({isTranslating: !_this.state.isTranslating, translation: {}});

          request({
            url: window.location.origin + '/translate',
            qs: {
              dict: action.query.dict,
              word: action.query.word,
              page: action.query.page,
            }
          }).then(function (match) {
              AppActions.getTranslation(match);
          });
          break;

        case AppConstants.TRANSLATED:
          _this.setState({isTranslating: !_this.state.isTranslating, translation: action.match});
          break;

        default:
      // no op
      }
    });
  },

  render: function () {
    return (
    <div>
      <WordLookup />
      <TranslationResults translation={this.state.translation} />
    </div>
    );
  }
});
