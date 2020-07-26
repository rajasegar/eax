const fs = require('fs');

module.exports = function (str) {
  fs.appendFile('eax.log', str + '\n', function (err) {
    if (err) throw err;
    //console.log('Saved!');
  });
};
