# dejizo-api-json-wrapper
A JSON wrapper for the Dejizo web service.

Node.js sample usage
```
var readline = require('readline');
var Dejizo = require('./lib/dejizo');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function readMultipleLines () {
  rl.question('Type word: ', (answer) => {
    if (answer == 'quit') {
      rl.close();
    } else {
      var word = answer;
      rl.question('Type page: ', (answer) => {
        if (answer == 'quit') {
          rl.close();
        } else {
          Dejizo.parse(word, {match: 'STARTWITH', page: answer || 1}, function (err, matches) {
            if (!err) {
              if (matches.results.length > 0) {
                for (i in matches.results) {
                  var match = matches.results[i];
                  match.details(match.itemId, function (err, trans) {
                    if (!err) {
                      console.log('>Total matches: ' + matches.totalResults);
                      console.log('>Total pages: ' + matches.totalPages);
                      console.log('>Word: ' + match.matchedWord);
                      console.log('>Reading: ' + trans.reading + ' Meanings: ' + trans.meanings.join(', '));
                      readMultipleLines();
                    }
                  });
                }
              } else {
                console.log('>Total matches: ' + matches.totalResults);
                readMultipleLines();
              }
            } else {
              console.log('ERROR> ' + err);
              readMultipleLines();
            }
          });
        }
      });
    }
  });
}

rl.on('close', () => {
  process.exit(0);
});

readMultipleLines();

```