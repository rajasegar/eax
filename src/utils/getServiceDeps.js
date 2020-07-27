const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const checkOctane = require('../utils/isOctane');
const log = require('./log');

module.exports = function (file) {
  const isOctane = checkOctane();
  const regex = isOctane ? /@service (\w+)/ : /(\w+): service\(['a-zA-Z-]*\)/;

  return new Promise((resolve) => {
    if (fs.existsSync(file)) {
      const grepString = isOctane ? '@service' : ': service';
      exec(`cat ${file} | grep  "${grepString}"`)
        .then((data) => {
          let serviceNames = [];
          data.stdout.split('\n').forEach((line) => {
            const match = regex.exec(line);
            if (match) {
              // Pick the original service name or alias for fallback
              const serviceName = match[2] || match[1];
              serviceName && serviceNames.push(match[1]);
            }
          });
          resolve(serviceNames);
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
