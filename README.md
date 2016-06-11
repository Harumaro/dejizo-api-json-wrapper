# dejizo-api-json-wrapper
### A JSON wrapper for the Dejizo web service. / デ辞蔵ウェブサービスのJSONラッパー。

Sample usage / 使い方
```
Dejizo.parse('方', {dict: 'EdictJE', page: 1}).then(function (matches) {
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
});

```