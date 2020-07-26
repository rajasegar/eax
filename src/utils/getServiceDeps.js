const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const checkOctane = require('../utils/isOctane');
const log = require('./log');

module.exports = function(file) {

const isOctane = checkOctane();
  const regex = isOctane 
  ? /@service (\w+)/
  : /(\w+): service\(\)/;

  return new Promise(resolve => {
    if(fs.existsSync(file)) {
    const grepString = isOctane ? '@service' : ': service()';
      exec(`cat ${file} | grep  "${grepString}"`).then(data => {
        log(data);
        let serviceNames = [];
        data.stdout.split('\n').forEach(line => {
          const match = regex.exec(line);
          log(match);
          match && match[1] && serviceNames.push(match[1]);
        });
        resolve(serviceNames);
      }).catch(() => {

        // log erro
        resolve([]);
      });
    } else {
      resolve([]);
    }
  });
};
