const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const log = require('./log');

module.exports = function (file) {
  const regex = /import [a-zA-Z- {},]* from '\w+\/mixins\/([a-zA-Z-]*)';/;

  return new Promise((resolve) => {
    if (fs.existsSync(file)) {
      exec(`cat ${file} | grep  "mixins/"`)
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
