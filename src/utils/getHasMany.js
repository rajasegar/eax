const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

module.exports = function(file) {

  const regex = /\w+: hasMany\('([a-zA-Z-]*)'/

  return new Promise(resolve => {
    if(fs.existsSync(file)) {
      exec(`cat ${file} | grep "hasMany("`).then(data => {
        let names = [];
        data.stdout.split('\n').forEach(line => {
          const match = regex.exec(line);
          match && match[1] && names.push(match[1]);
        });
        resolve(names);
      }).catch(() => {
        // log error
        resolve([]);
      });
    } else {
      resolve([]);
    }
  });
};
