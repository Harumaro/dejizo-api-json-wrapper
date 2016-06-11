import React from 'react';
import Translation from '../components/Translation.react';
import * as AppActions from '../actions/AppActions';

export default React.createClass({
  getInitialState: function () {
    return {
    };
  },

  render: function () {
    if (Object.keys(this.props.translation).length == 0) {
      return null;
    }

    var results = [];
    var translation = JSON.parse(this.props.translation);
    for (var key in translation.results) {
      results.push(<Translation key={key} word={translation.results[key].matchedWord} details={translation.results[key].details} />);
    }

    return (
        <div id="results">
            <ul id="results-list">{results}</ul>
        </div>
    );
  }
});
