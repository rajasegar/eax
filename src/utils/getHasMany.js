const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const isOctane = require('./isOctane');

module.exports = function (file) {
  const _isOctane = isOctane();

  const regex = _isOctane
    ? /\w+: hasMany\('([a-zA-Z-]*)'/
    : /@hasMany\('([a-zA-Z-]*)'/;

  return new Promise((resolve) => {
    if (fs.existsSync(file)) {
      const grepString = _isOctane ? '@hasMany' : 'hasMany(';
      exec(`cat ${file} | grep "${grepString}"`)
        .then((data) => {
          let names = [];
          data.stdout.split('\n').forEach((line) => {
            const match = regex.exec(line);
            match && match[1] && names.push(match[1]);
          });
          resolve(names);
        })
        .catch(() => {
          // log error
          resolve([]);
        });
    } else {
      resolve([]);
    }
  });
};
