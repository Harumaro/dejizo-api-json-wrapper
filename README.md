# dejizo-api-json-wrapper
### A JSON wrapper for the Dejizo web service. / デ辞蔵ウェブサービスのJSONラッパー。

Node.js sample usage / NodeJSでの使い方
```
var Dejizo = require('./lib/dejizo');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var dict = '';
var word = '';
var page = '';

var readState = 0;
var questions = [
  'Dictionary: [1] jp [2] en> (1) ',
  'Type word> ',
  'Type page (1)> ',
];

console.log('Type quit at any time to exit.');
rl.setPrompt(questions[readState]);
rl.prompt();

rl.on('line', (line) => {
  line = line.trim();
  if (line === 'quit') {
    rl.close();
  }
  switch (readState %= 3) {
    case 0:
      dict = (!line || line == 1) && 'EdictJE' || 'EJdict';
      rl.setPrompt(questions[++readState]);
      rl.prompt();
      break;
    case 1:
      word = line;
      rl.setPrompt(questions[++readState]);
      rl.prompt();
      break;
    case 2:
      rl.setPrompt(questions[++readState % 3]);
      Dejizo.parse(word, {dict: dict, page: line || 1}).then(function (matches) {
        console.log('\n>Total matches: ' + matches.totalResults);
        console.log('>Total pages: ' + matches.totalPages);
        if (matches.results.length > 0) {
          for (i in matches.results) {
            console.log('>Word: ' + matches.results[i].matchedWord);
            console.log('>Reading: ' + matches.results[i].details.reading);
            console.log('>Meaning: ' + matches.results[i].details.meaning + '\n');
          }
          rl.prompt();
        } else {
          rl.prompt();
        }
      }).catch(function (err) {
        console.log('ERROR> ' + err);
        rl.prompt();
      });
      break;
  }
});

rl.on('close', () => {
  process.exit(0);
});

```