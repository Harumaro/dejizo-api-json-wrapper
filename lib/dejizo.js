var request = require('request-promise');
var xml2js = require('xml2js');
var utils = require('./utils');

var allowedScopes = ['HEADWORD', 'ANYWHERE'];
var allowedMatch = ['EXACT', 'STARTWITH', 'ENDWITH', 'CONTAIN'];
var allowedMerge = ['AND', 'OR'];

var reTrim = /\n|\r|\s/g;

var defaults = {
  dict: 'EdictJE', // Allowed: EJdict (en->jp), EdictJE (jp->en), wpedia (wiktionary). Other dictionary sources are not free to use.
  scope: 'HEADWORD', // either HEADWORD or ANYWHERE. HEADWORD: returns only results where the word is in the matches, ANYWHERE: returns any result where the keyword is in both the matches and the text 
  match: 'EXACT', // either EXACT, STARTWITH, ENDWITH or CONTAIN
  merge: 'AND', // either AND or OR
  elemPerPage: 1, // elements returned at once
  page: 1 // page
};

var Dejizo = {
  /**
   * @argument {string} word
   * @argument {object} options (optional)
   * @argument {object Function} callback (optional)
   */
  parse: function () {
    var _this = this;
    var word = arguments[0];
    var options = {}.toString.call(arguments[1]) != '[object Function]' && arguments[1] || {};
    var callback = {}.toString.call(arguments[1]) == '[object Function]' && arguments[1] || arguments[2];

    for (var i in options) {
      switch (i) {
        case 'scope':
          if (allowedScopes.indexOf(options[i]) < 0) {
            callback && {}.toString.call(callback) == '[object Function]' && callback(new Error('Wrong Scope. Must be either HEADWORD or ANYWHERE'));
            return;
          }
          break;
        case 'match':
          if (allowedMatch.indexOf(options[i]) < 0) {
            callback && {}.toString.call(callback) == '[object Function]' && callback(new Error('Wrong Match. Must be either EXACT, STARTWITH, ENDWITH or CONTAIN'));
            return;
          }
          break;
        case 'merge':
          if (allowedMerge.indexOf(options[i]) < 0) {
            callback && {}.toString.call(callback) == '[object Function]' && callback(new Error('Wrong Merge. Must be either AND or OR'));
            return;
          }
          break;
        case 'elemPerPage':
          options.elemPerPage > 20 && callback(new Error('Dejizo does not allow that many requests per second.'));
          break;
      }
    }
    options = utils.extend(this, defaults, options);

    // get dictionary items
    request({
      url: 'http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite',
      qs: {
        Dic: options.dict,
        Word: word,
        Scope: options.scope,
        Match: options.match,
        Merge: options.merge,
        PageSize: options.elemPerPage,
        PageIndex: options.page,
        Prof: 'XHTML'
      }
    }).then(function (body) {
      xml2js.parseString(body, function (err, result) {
        if (result.SearchDicItemResult.ItemCount > 0) {
          var items = [];
          var itemTitle = result.SearchDicItemResult.TitleList[0].DicItemTitle;
          for (var i in itemTitle) {
            items.push({
              itemId: itemTitle[i].ItemID[0],
              matchedWord: itemTitle[i].Title[0].span[0]._,
              details: function (itemId, transCallback) {
                _this.getDetails(itemId, options.dict, transCallback);
              }
            });
          }

          callback(undefined, {
            results: items,
            totalResults: result.SearchDicItemResult.TotalHitCount[0],
            totalPages: result.SearchDicItemResult.TotalHitCount[0]/options.elemPerPage
          });
        } else {
          callback(undefined, {
            results: [],
            totalResults: 0,
            totalPages: 0
          });
        }
      });
    }).catch(function (err) {
      callback && {}.toString.call(callback) == '[object Function]' && callback(new Error('Dictionary source not found.'));
    });

  },
  getDetails: function (itemId, dict, callback) {
    request({
      url: 'http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite',
      qs: {
        Dic: dict,
        Item: itemId,
        Loc: '',
        Prof: 'XHTML'
      }
    }).then(function (body) {
      xml2js.parseString(body, function (err, result) {
        if (!err) {
          var meanings = [];
          var itemResult = result.GetDicItemResult.Body[0].div[0].div[0].div;
          for (var i in itemResult) {
            meanings.push(itemResult[i]);
          }

          callback(undefined, {
              reading: result.GetDicItemResult.Head[0].div[0].span[0]._.replace(reTrim, ''),
              meanings: meanings
            });
        } else {
          callback(undefined, {
            reading: '',
            meanings: ''
          });
        }
      });
    }).catch(function (err) {
      callback && {}.toString.call(callback) == '[object Function]' && callback(new Error('Dictionary voice not found.'));
    });
  }
};

module.exports = Dejizo;
