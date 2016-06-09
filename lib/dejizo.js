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
  elemPerPage: 10, // elements returned at once
  page: 1 // page
};

var Dejizo = {
  /**
   * @argument {string} word
   * @argument {object} options (optional)
   * @returns A promise with the match found
   */
  parse: function () {
    var _this = this;
    var word = arguments[0];
    var options = arguments[1] || {};

    return new Promise(function (resolve, reject) {
      for (var i in options) {
        switch (i) {
          case 'scope':
            if (allowedScopes.indexOf(options[i]) < 0) {
              reject(new Error('Wrong Scope. Must be either HEADWORD or ANYWHERE'));
              return;
            }
            break;
          case 'match':
            if (allowedMatch.indexOf(options[i]) < 0) {
              reject(new Error('Wrong Match. Must be either EXACT, STARTWITH, ENDWITH or CONTAIN'));
              return;
            }
            break;
          case 'merge':
            if (allowedMerge.indexOf(options[i]) < 0) {
              reject(new Error('Wrong Merge. Must be either AND or OR'));
              return;
            }
            break;
          case 'elemPerPage':
            options.elemPerPage > 20 && reject(new Error('Dejizo does not allow that many requests per second.'));
            break;
        }
      }
      options = utils.extend(true, defaults, options);

      _this._parse.call(_this, word, options).then(function(items) {
        resolve(items);
      }).catch(function(err) {
        reject(err);
      });
    });
  },
  _parse: function (word, options) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      // get dictionary items
      request({
        url: 'http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite',
        qs: {
          Dic: options.dict,
          Word: word.trim(),
          Scope: options.scope,
          Match: options.match,
          Merge: options.merge,
          PageSize: options.elemPerPage,
          PageIndex: options.page - 1,
          Prof: 'XHTML'
        }
      }).then(function (body) {
        xml2js.parseString(body, function (err, result) {
          if (result.SearchDicItemResult.ItemCount > 0) {
            var items = [];
            var details = [];
            var itemTitle = result.SearchDicItemResult.TitleList[0].DicItemTitle;
            for (var i in itemTitle) {
              var match = {
                itemId: itemTitle[i].ItemID[0],
                matchedWord: itemTitle[i].Title[0].span[0]._,
              };
              details.push(_this.getDetails(match, options.dict));

              items.push(match);
            }

            Promise.all(details).then(function (items) {
              resolve({
                results: items,
                totalResults: result.SearchDicItemResult.TotalHitCount[0],
                totalPages: Math.ceil(result.SearchDicItemResult.TotalHitCount[0] / options.elemPerPage)
              });
            }).catch(function(err) {
              reject(err);
            });
          } else {
            resolve({
              results: [],
              totalResults: 0,
              totalPages: 0
            });
          }
        });
      }).catch(function (err) {
        reject(new Error('Dictionary source not found.'));
      });
    });
  },
  getDetails: function (match, dict) {
    return new Promise(function (resolve, reject) {
      request({
        url: 'http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite',
        qs: {
          Dic: dict,
          Item: match.itemId,
          Loc: '',
          Prof: 'XHTML'
        }
      }).then(function (body) {
        xml2js.parseString(body, function (err, result) {
          if (!err) {
            var meaning = [];
            var itemResult = result.GetDicItemResult.Body[0].div[0].div[0];
            if ({}.toString.call(itemResult) == '[object Object]') {
              itemResult = itemResult.div;
              for (var i in itemResult) {
                meaning.push(itemResult[i]);
              }
              meaning.join(', ');
            } else {
              meaning = itemResult;
            }

            match.details = {
              reading: result.GetDicItemResult.Head[0].div[0].span[0]._.replace(reTrim, ''),
              meaning: meaning
            };
            resolve(match);
          } else {
            match.details = {
              reading: '',
              meanings: ''
            };

            resolve(match);
          }
        });
      }).catch(function (err) {
        reject(new Error('Dictionary voice not found.'));
      });
    });
  }
};

module.exports = Dejizo;
