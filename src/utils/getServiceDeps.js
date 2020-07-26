const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

module.exports = function(file) {

  const regex = /(\w+): service\(\)/

  return new Promise(resolve => {
    if(fs.existsSync(file)) {
      exec(`cat ${file} | grep  ": service()"`).then(data => {
        let serviceNames = [];
        data.stdout.split('\n').forEach(line => {
          const match = regex.exec(line);
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
