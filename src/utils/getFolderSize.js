const fs = require('fs');
const walkSync = require('walk-sync');

const getTotalSize = function (directoryPath) {
  const arrayOfFiles = walkSync(directoryPath, {
    directories: false,
    ignore: ['node_modules', '.git', 'tmp'],
    includeBasePath: true,
  });

  let promises = arrayOfFiles.map(function (filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) reject(err);
        resolve(stats);
      });
    });
  });

  return Promise.all(promises).then((values) => {
    let sizes = values.map((v) => v.size);
    let _totalSize = sizes.reduce((a, b) => a + b, 0);
    return _totalSize;
  });
};

module.exports = getTotalSize;
