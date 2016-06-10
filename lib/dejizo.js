import request from 'request-promise';
import xml2js from './xml2js-promise';
import extend from './utils';

var allowedScopes = ['HEADWORD', 'ANYWHERE'];
var allowedMatch = ['EXACT', 'STARTWITH', 'ENDWITH', 'CONTAIN'];
var allowedMerge = ['AND', 'OR'];

var reTrim = /\n|\r|\s/g;

var defaults = {
  /** @property Allowed: EJdict (en->jp), EdictJE (jp->en), wpedia (wiktionary). Other dictionary sources are not free to use. */
  dict: 'EdictJE',
  /** @property Either HEADWORD or ANYWHERE. HEADWORD: returns only results where the word is in the matches, ANYWHERE: returns any result where the keyword is in both the matches and the text */
  scope: 'HEADWORD',
  /** @property Either EXACT, STARTWITH, ENDWITH or CONTAIN */
  match: 'EXACT',
  /** @property Either AND or OR */
  merge: 'AND',
  /** @property Elements returned at once */
  elemPerPage: 10,
  /** @property Current Page */
  page: 1
};

var Dejizo = {
  /**
   * Looks for a word on the web service Dejizo
   * 
   * @argument {string} the word to look for in the dictionary
   * @argument {object} options for dejizo (optional)
   * @returns A promise with the match found
   */
  parse: async function () {
    var _this = this;
    var word = arguments[0];
    var options = arguments[1] || {};

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

    options = extend(true, defaults, options);

    // Gets entries from the dictionary
    var body = null;
    try {
      body = await request({
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
      });
    } catch (err) {
      return new Error('Dictionary source not found.');
    }
    if (body) {
      var result = null;
      try {
        var result = await xml2js(body);
      } catch (err) {
        return err;
      }
      if (result) {
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

          // Looks for details for each entry
          try {
            var matches = await all(details);
            return {
              results: matches,
              totalResults: result.SearchDicItemResult.TotalHitCount[0],
              totalPages: Math.ceil(result.SearchDicItemResult.TotalHitCount[0] / options.elemPerPage)
            };
          } catch (err) {
            return err;
          }
        } else {
          return {
            results: [],
            totalResults: 0,
            totalPages: 0
          };
        }
      }
    }
  },
  /**
   * Looks for word details for each entry found in the web service
   * 
   * @parameter {Object} The word matched object
   * @parameter {string} The dictionary to look into
   * @returns A promise with the details for the match found
   */
  getDetails: function (match, dict) {
    return new Promise(async function (resolve, reject) {
      var body = null;
      try {
        body = await request({
          url: 'http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite',
          qs: {
            Dic: dict,
            Item: match.itemId,
            Loc: '',
            Prof: 'XHTML'
          }
        });
      } catch (err) {
        reject(new Error('Dictionary voice not found.'));
      }
      if (body) {
        var result = null;
        try {
          var result = await xml2js(body);
        } catch (err) {
          match.details = {
            reading: '',
            meanings: ''
          };

          resolve(match);
        }
        if (result) {
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
        }
      }
    });
  }
};

module.exports = Dejizo;
