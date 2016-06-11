import React from 'react';
import * as AppActions from '../actions/AppActions';

export default React.createClass({
  getInitialState: function () {
    return {
    };
  },

  render: function () {
      console.log(this.props);
    return (
        <li>
            <p>Word: {this.props.word}</p>
            <p>Reading: {this.props.details.reading}</p>
            <p>Meaning: {this.props.details.meaning}</p>
        </li>
    );
  }
});