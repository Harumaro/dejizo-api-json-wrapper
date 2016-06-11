// Author credit: https://gist.github.com/adjohnson916/10166033

import * as xml2jsBasic from 'xml2js';

export default function xml2js (input) {
  return new Promise(function (resolve, reject) {
    xml2jsBasic.parseString(input, function (err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}
