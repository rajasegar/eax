const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const checkOctane = require('./isOctane');
const log = require('./log');

module.exports = function (file) {
  const isOctane = checkOctane();
  const regex = isOctane
    ? /\w+: belongsTo\('([a-zA-Z-]*)'/
    : /@belongsTo\('([a-zA-Z-]*)'/;

  return new Promise((resolve) => {
    if (fs.existsSync(file)) {
      const grepString = isOctane ? '@belongsTo' : ': belongsTo(';
      exec(`cat ${file} | grep  "${grepString}"`)
        .then((data) => {
          let names = [];
          data.stdout.split('\n').forEach((line) => {
            const match = regex.exec(line);
            match && match[1] && names.push(match[1]);
          });
          resolve(names);
        })
        .catch((err) => {
          log(err);
          resolve([]);
        });
    } else {
      resolve([]);
    }
  });
};
