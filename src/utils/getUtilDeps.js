const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

module.exports = function(file) {

  const regex = /import [a-zA-Z {},]* from '\w+\/utils\/([a-zA-Z-]*)';/

  return new Promise(resolve => {
    if(fs.existsSync(file)) {
      exec(`cat ${file} | grep  "utils/"`).then(data => {
        let utilNames = [];
        data.stdout.split('\n').forEach(line => {
          const match = regex.exec(line);
          match && match[1] && utilNames.push(match[1]);
        });
        resolve(utilNames);
      }).catch(() => {

        // log erro
        resolve([]);
      });
    } else {
      resolve([]);
    }
  });

};
