const fs = require('fs');
const walkSync = require('walk-sync');

const getTotalSize = function (directoryPath) {
  const arrayOfFiles = walkSync(directoryPath, {
    directories: false,
    ignore: ['node_modules', '.git', 'tmp'],
    includeBasePath: true,
  });

  let totalSize = 0;

  arrayOfFiles.forEach(function (filePath) {
    totalSize += fs.statSync(filePath).size;
  });

  return totalSize;
};

module.exports = getTotalSize;
