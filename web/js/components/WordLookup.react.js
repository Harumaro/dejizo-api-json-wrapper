import React from 'react';
import * as AppActions from '../actions/AppActions';

export default React.createClass({
  getInitialState: function () {
    return {
      dict: '',
      word: '',
      page: 1
    };
  },
  handleDictChange: function (e) {
    this.setState({ dict: e.target.value });
  },
  handleWordChange: function (e) {
    this.setState({ word: e.target.value });
  },
  handlePageChange: function (e) {
    this.setState({ page: e.target.value });
  },
  render: function () {
    return (
    <div>
      <select name="dict" value={this.state.dict} onChange={this.handleDictChange}>
        <option value="EdictJE">
          JP -> EN
        </option>
        <option value="EJdict">
          EN -> JP
        </option>
      </select>
      <input
        name="word"
        placeholder="Word"
        title="Word"
        type="text"
        value={this.state.word}
        onChange={this.handleWordChange} />
      <input
        name="page"
        placeholder="Page"
        title="Page"
        type="text"
        value={this.state.page}
        onChange={this.handlePageChange} />
      <button onClick={this._onTranslate}>Lookup</button>
    </div>
    );
  },

  _onTranslate: function () {
    AppActions.translate({dict: this.state.dict, word: this.state.word, page: this.state.page});
  }
});
