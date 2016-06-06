# dejizo-api-json-wrapper
### A JSON wrapper for the Dejizo web service. / デ辞蔵ウェブサービスのJSONラッパー。

Node.js sample usage / NodeJSでの使い方
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
      rl.question('Type page: (1) ', (answer) => {
        if (answer == 'quit') {
          rl.close();
        } else {
          Dejizo.parse(word, {dict: 'EdictJE', page: answer || 1}).then(function (matches) {
            if (matches.results.length > 0) {
              var details = [];
              for (i in matches.results) {
                details.push(matches.results[i].details);
              }
              Promise.all(details).then(function (match) {
                for (i in match) {
                  console.log('\n>Total matches: ' + matches.totalResults);
                  console.log('>Total pages: ' + matches.totalPages);
                  console.log('>Word: ' + match[i].matchedWord);
                  console.log('>Reading: ' + match[i].details.reading)
                  console.log('>Meaning: ' + match[i].details.meaning);
                }
                readMultipleLines();
              }).catch(function (err) {
                console.log('ERROR> ' + err);
                readMultipleLines();
              });
            } else {
              console.log('>Total matches: ' + matches.totalResults);
              readMultipleLines();
            }
          }).catch(function (err) {
            console.log('ERROR> ' + err);
            readMultipleLines();
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